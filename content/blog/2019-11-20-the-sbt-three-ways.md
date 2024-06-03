---
layout: single
title: "The RTX Shader Binding Table Three Ways"
date: 2019-11-20
tags: [graphics, raytracing]
url: /graphics/2019/11/20/the-sbt-three-ways
params:
  mathjax: true
---

DirectX Ray Tracing, Vulkan's NV Ray Tracing extension, and OptiX (or collectively, the RTX APIs)
build on the same execution model for running user code to trace
and process rays. The user creates a _Shader Binding Table_ (SBT), which consists of a set
of shader function handles and embedded parameters for these functions. The shaders in the table
are executed depending on whether or not a geometry was hit by a ray, and which geometry was hit.
When a geometry is hit, a set of parameters specified on both the host and
device side of the application combine to determine which shader is executed.
The RTX APIs provide a great deal of flexibility in how the SBT can be set up and
indexed into during rendering, leaving a number of options open to applications.
However, with incorrect SBT access leading
to crashes and difficult bugs, sparse examples or documentation, and
subtle differences in naming and SBT setup between the APIs, properly setting up
and accessing the SBT is an especially thorny part of the RTX APIs for new users.

In this post we'll look at the similarities and differences of each ray tracing API's shader
binding table to gain a fundamental understanding of the execution model. I'll then
present an interactive tool for constructing the SBT, building a scene which uses it,
and executing trace calls on the scene to see which hit groups and miss shaders are called.
Finally, we'll look at how this model can be brought back to the CPU using Embree,
to potentially build a unified low-level API for ray tracing.

**Updated 5/1/2020:** Added discussion on `KHR_ray_tracing` for Vulkan.

<!--more-->

# The RTX Execution Model

To motivate why the RTX APIs use a shader binding table, we need to look at how
ray tracing differs from rasterization.
In a rasterizer we can batch objects by the shader they use and thus
always know the set of shaders which must be called to render a set of objects.
However, in a ray tracer we don't know
which object a ray will hit when we trace it, and thus need the entire scene available
in memory (or some proxy of it) along with a function to call for each object
which can process intersections with it.
Our ray tracer needs access to all of the shaders which might be called for the scene, and a way
to associate them with the objects in the scene. Each of the RTX APIs implements this using
the _Shader Binding Table_. An analogy in the rasterization pipeline is bindless rendering, where
the required data (textures, buffers) is uploaded to the GPU and accessed as needed by ID
at runtime in the shader. In some sense, our shader dispatch is now "bindless."
The RTX execution pipeline is shown below.

{{< numbered_fig
	src="/img/rtx-execution-model.svg"
    caption=`The RTX API execution pipeline.
     (a) Rays are traced in the ray generation shader and traversed through
     the acceleration structure. (b) During traversal rays are tested against primitives
     in the leaf nodes of the acceleration structure. Note that for triangles the intersection
     shader is not needed as it is performed in hardware. (c) If an intersection is
     found the any hit shader is called.  After the traversal
     is complete (d) the closest hit shader of the hit geometry is called if a
     hit was found, otherwise (e) the miss shader is called.
     These shaders then return control to the caller of TraceRay, or can
     make recursive trace calls.`
     >}}

The different shaders used in the ray tracing pipeline are:

- Ray Generation: Called as the entry point to the ray tracer to generate the initial
  set of rays to be traced.
- Intersection: When using non-triangle geometry an intersection shader is required
  to compute ray intersections with the custom primitives. This isn't necessary
  for triangle meshes, as the ray-triangle intersection test is done in hardware.
- Any Hit: Is called for each potential intersection found along the ray,
  and can be used to filter potential intersections. For example, when using alpha
  cutout textures the Any Hit shader is used to discard hits against the cutout regions
  of the geometry.
- Closest Hit: Is called for the closest hit found along the ray, and can compute and
  return intersection information through the ray payload or trace additional rays.
- Miss: When no hit is found, the miss shader is called. The Miss shader
  can be used, for example, to return a background color for primary rays or mark occlusion rays
  as unoccluded.

The intersection, any hit and closest hit shaders are used together as a Hit Group to describe
how to process rays and intersections with a geometry. The closest hit shader is required,
while the intersection and any hit shaders are optional.

> Note: for geometry not using an any hit shader, explicitly disable it using
> the corresponding force opaque or disable any hit geometry, instance or ray flags,
> otherwise an empty any hit shader will be called.

For a detailed overview and other interesting applications and use cases, see the
[Ray Tracing Gems Book](http://www.realtimerendering.com/raytracinggems/),
or check out the
[Introduction to DirectX Ray Tracing](http://intro-to-dxr.cwyman.org/) course
given at SIGGRAPH 2018, or the [Optix 7 Tutorial](https://gitlab.com/ingowald/optix7course)
given at SIGGRAPH 2019.

# The Shader Binding Table

The Shader Binding Table contains the entire set of shaders which may be called when ray tracing
the scene, along with embedded parameters to be passed to these shaders. Each pair
of shader functions and embedded parameters is referred to as a _Shader Record_.
Since it's common for geometries to share the same shader code but access different
data, the embedded parameters in the record can be used to pass such data to
the shaders. Thus, there should be at least one Shader Record in the table for
each unique combination of shader functions and embedded parameters. It is possible
to write the same shader record multiple times in the table, and this may be
necessary depending on how the instances and geometries in the scene are setup.
Finally, it is also possible to use the instance and geometry IDs available
in the shaders to perform indirect access into other tables containing the scene data.

## Shader Record

A Shader Record combines one or more shader functions with a set of parameters to
be passed to these functions when they're called by the runtime.
Each shader record is written into the SBT as a set of function handles followed by the
embedded parameters. While the size of the handles, alignment requirements for
the records, and parameters which can be embedded in the table differ across
the RTX APIs, the functionality of the shader record is the same.

#### Ray Generation

The Ray Generation shader record consists of a single function referring to the
ray generation shader to be called, along with any desired embedded parameters
for the function. While some parameters can be passed in the shader record, for parameters
that get updated each frame (e.g., the camera position) it is better to pass them separately through a
different globally accessible buffer.
While multiple ray generation shaders can be written into the table,
only one can be called for a launch.

#### Hit Group

Each Hit Group shader record consists of a Closest Hit shader,
Any Hit shader (optional) and Intersection shader (optional), followed by
the set of embedded parameters to be made available to the three shaders.
As the hit group which should be called is dependent on the instance
and geometry which were hit and the ray type, the indexing rules for hit groups are
the most complicated. The rules for hit group indexing are discussed in detail
below.

#### Miss

The Miss shader record consists of a single function referring to the miss shader
to be used, along with any desired embedded parameters for the function,
similar to the ray generation record. The miss shader to call is selected
by the ray type, though is specified separately from the hit group ray type to
allow greater flexibility. This flexibility can be used to implement optimizations for
[occlusion rays, for example](/graphics/2019/09/06/faster-shadow-rays-on-rtx).

## Hit Group Shader Record Index Calculation

The main point of difficulty in setting up the SBT and scene geometry is understanding
how the two are coupled together, i.e., if a geometry is hit by a ray,
which shader record is called? The shader record to call is determined by parameters set on the
instance, trace ray call, and the order of geometries in the bottom-level acceleration structure.
These parameters are set on both the host and device during different parts of the scene
and pipeline setup and execution, making it difficult to see how they fit together.

When setting up the scene, the bottom level acceleration structured referenced by
each instance can contain an array of geometries. The index of each geometry in this array
is the geometry's ID \\( ( \mathbb{G}\_\text{ID} ) \\). Each instance can be assigned a starting
offset within the SBT (\\(\mathbb{I}\_\text{offset}\\)) where its sub-table of hit group records start.

When tracing a ray on the device we can specify an additional SBT offset for the ray (\\(R*\text{offset}\\)),
often referred to as the ray "type", an SBT stride to apply (\\(R*\text{stride}\\)), typically referred
to as the number of ray "types", and the miss shader index to call (\\(R\_\text{miss}\\)).

The equation used to determine which hit group record is called when a ray with SBT
offset \\(R*\text{offset}\\) and stride \\( R*\text{stride} \\) hits a geometry with
ID \\(\mathbb{G}\_\text{ID}\\) in an instance with offset \\(\mathbb{I}\_\text{offset}\\) is:

$$
\begin{align}
\text{HG} = \\&\text{HG}[0] + \left( \text{HG}\_\text{stride} \times
    \left( R\_\text{offset} + R\_\text{stride} \times \mathbb{G}\_\text{ID} + \mathbb{I}\_\text{offset} \right)\right)
\end{align}
$$

\\(\\&\text{HG}[0]\\) is the starting address of the table containing the hit group records, and \\(\text{HG}\_\text{stride}\\)
is the stride between hit group records (in bytes) in the SBT.

> Note: If you're coming from Ray Tracing Gems, in 3.10 the parameter \\(R*\text{offset}\\) is referred
> to as \\(I*\text{ray}\\), and \\(R*\text{stride}\\) is referred to as \\(\mathbb{G}*\text{mult}\\).
> While the equations are the same, the distinction of which parameters come from the ray,
> geometry, and instance are clearer when written as above.

The ray offset (\\(R*\text{offset}\\)) and stride (\\(R*\text{stride}\\)) parameters are set per-ray
when you call trace ray on the device. In a typical ray tracer, \\(R*\text{offset}\\) is the ray "type",
e.g., primary (0) or occlusion (1), and \\(R*\text{stride}\\) is the total number of ray types, in this example, 2.
These parameters allow us to change which hit group is called based on
the desired ray query. For example, we can often perform a cheaper intersection test for occlusion
rays since we only care if the object was hit, but don't need the exact hit point.
The hit groups for the different ray types of the geometry are written consecutively in the SBT,
so the ray stride is used to step the next geometry's set of hit groups.
This acts like a flattened 2D array of \\(\text{num geometries} \times \text{num ray types}\\) elements.
In a typical ray tracer where we would have a separate primary and occlusion hit group
record per-geometry, this stride would be 2.

The instance offset (\\(\mathbb{I}\_\text{offset}\\)) and geometry ID (\\(\mathbb{G}\_\text{ID}\\))
come from how each instance and bottom-level acceleration structure are configured when setting up
the scene on the host. Each instance is assigned
a base offset into the SBT, \\(\mathbb{I}\_\text{offset}\\), which defines where its sub-table of hit group
records begins. Note that this is not multiplied by \\(R*\text{stride}\\) in Equation 1.
The geometry id, \\(\mathbb{G}\_\text{ID}\\), is set implicitly as the index of the geometry
in the bottom-level acceleration structure being instanced, and is multiplied by \\(R*\text{stride}\\).
In a typical ray tracer with two ray types (primary and occlusion), a hit group record for each ray type
per-geometry and, where instances do not share hit group records, the offset
\\(\mathbb{I}\_\text{offset}^i\\) for instance \\(i\\) can be calculated as:

$$
\begin{align}
\mathbb{I}\_\text{offset}^i &= \mathbb{I}\_\text{offset}^{i - 1} + \mathbb{I}\_\text{geom}^{i - 1} \times 2 \\\\
\text{where} \\;\\; \mathbb{I}\_\text{offset}^0 &= 0 \\
\end{align}
$$

Where \\(\mathbb{I}\_\text{geom}^i\\) are the number of geometries in instance \\(i\\).

The hit group records in the SBT would then be written in order by instance and the geometry order within
the instance's bottom-level acceleration structure, with separate primary and occlusion hit groups.
A scene with two instances, the first instance containing one geometry and the second containing two geometries,
would have its hit group records laid out as shown below.

{{< numbered_fig
	src="/img/2instance_sbt_example.svg"
caption=`SBT Hit Group record layout for a typical ray tracer with two ray types
    rendering a scene with two instances, one of which has two geometries.
    In this example each hit group record
    is 32 bytes, with a stride of 64 bytes. When tracing a ray, \\( R_\text{stride} = 2 \\),
    and \\( R_\text{offset} \\) will be 0 for primary rays and 1 for occlusion rays.`
    >}}

## Miss Shader Record Index Calculation

The indexing rules for miss shader records are far simpler than for hit groups. When
tracing a ray we pass an additional miss shader offset, \\(R\_\text{miss}\\) which is just
the index of the miss shader to call if the ray does not hit an object.

$$
\begin{align}
\text{M} = \\&\text{M}[0] + \text{M}\_\text{stride} \times  R\_\text{miss}
\end{align}
$$

As with the hit group records, \\( \\&\text{M}[0] \\) is the starting address of the table containing
the miss records and \\(\text{M}\_\text{stride}\\) is the stride between miss records
in bytes.

# API Specific Details

Now that we have a unified terminology to work with across the RTX APIs and took a general
look at how the Shader Binding Table works, we'll dive into the API-specific details of the SBT
for each API.
In each API the SBT is passed as a set of one or more buffers of shader records to the
launch call (each record type can be in a separate buffer, or all in one),
with information specifying the starting address and stride of each
group of records. Each record consists of an API specific shader handle followed by any
embedded parameters for the record.
The biggest difference between the APIs is in how the embedded parameters for a shader record
are specified on the host and retrieved on the device, and the types of parameters which can be embedded.
The sizes of the shader record handles and their alignment requirements can
also differ between the APIs.

## DirectX Ray Tracing

For more documentation about the DXR API, also see the
[MSDN DXR Documentation](https://docs.microsoft.com/en-us/windows/win32/direct3d12/direct3d-12-raytracing),
the [DXR HLSL Documentation](https://docs.microsoft.com/en-us/windows/win32/direct3d12/direct3d-12-raytracing-hlsl-shaders)
and the [DXR Specification](https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html).
Here we'll just focus on the parts specific to the Shader Binding Table indexing.

### Shader Records and Parameters

In DXR, the parameters embedded in the shader record can be 8-byte handles
(e.g., buffers, textures, etc.) or pairs of 4-byte constants (a single 4-byte constant
must be padded to 8-bytes). The mapping of these input parameters from the shader record
to the shader "registers" is specified using a
[Local Root Signature](https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#resource-binding).
The registers used for the local root signature parameters should not overlap with
those used by the global root signature, which is shared by all shaders.
One way to avoid conflicts is to use separate register spaces for the global and
local root signature parameter registers.

The shader handle size is defined by `D3D12_SHADER_IDENTIFIER_SIZE_IN_BYTES` (32 bytes),
the stride between records must be a multiple of `D3D12_SHADER_IDENTIFIER_SIZE_IN_BYTES`,
each shader table start address must be aligned to `D3D12_RAYTRACING_SHADER_TABLE_BYTE_ALIGNMENT` (64 bytes).
The maximum size allowed for the stride is 4096 bytes, placing an upper bound on the number of
parameters which can be embedded for a shader record.

### Instance Parameters

Instances in DXR are specified through the [`D3D12_RAYTRACING_INSTANCE_DESC`](https://docs.microsoft.com/en-us/windows/win32/api/d3d12/ns-d3d12-d3d12_raytracing_instance_desc)
structure:

```c++
typedef struct D3D12_RAYTRACING_INSTANCE_DESC {
  FLOAT Transform[3];
  UINT InstanceID : 24;
  UINT InstanceMask : 8;
  UINT InstanceContributionToHitGroupIndex : 24;
  UINT Flags : 8;
  D3D12_GPU_VIRTUAL_ADDRESS AccelerationStructure;
} D3D12_RAYTRACING_INSTANCE_DESC;
```

The parameters which effect the SBT indexing are:

- `InstanceContributionToHitGroupIndex`: This sets the instance's SBT offset, \\(\mathbb{I}\_\text{offset}\\)
- `InstanceMask`: While the mask does not affect which hit group is called, it can
  be used to skip traversal of instances entirely, by masking them out of the traversal

### Trace Ray Parameters

In the ray generation, closest hit, and miss shaders the HLSL
[TraceRay](https://docs.microsoft.com/en-us/windows/win32/direct3d12/traceray-function) function
can be called to trace rays through the scene.

```hlsl
Template<payload_t>
void TraceRay(RaytracingAccelerationStructure AccelerationStructure,
              uint RayFlags,
              uint InstanceInclusionMask,
              uint RayContributionToHitGroupIndex,
              uint MultiplierForGeometryContributionToHitGroupIndex,
              uint MissShaderIndex,
              RayDesc Ray,
              inout payload_t Payload);
```

TraceRay takes the acceleration structure to trace against, a set of ray flags to adjust the traversal being
performed, the instance mask, SBT indexing parameters, the ray, and the payload to be updated by the
closest hit or miss shaders.
The parameters which affect the SBT indexing are:

- `InstanceInclusionMask`: This mask affects which instances are masked out by and'ing it
  with each instance's `InstanceMask`.
- `RayContributionToHitGroupIndex`: This is the ray's SBT offset, \\(R\_\text{offset}\\).
- `MultiplierForGeometryContributionToHitGroupIndex`: This is the ray's SBT stride \\(R\_\text{stride}\\).
- `MissShaderIndex`: This is the miss shader index to call, \\(R\_\text{miss}\\).

## Vulkan NV Ray Tracing

This post was originally written when only the `NV_ray_tracing` extension was available, which is discussed here.
I've since updated the post (5/1/2020) with `KHR_ray_tracing`, which is discussed in the next section.

For more documentation about the Vulkan NV Ray Tracing extension, also
[extension specification](https://www.khronos.org/registry/vulkan/specs/1.1-extensions/html/vkspec.html#VK_NV_ray_tracing),
[manual page](https://www.khronos.org/registry/vulkan/specs/1.1-extensions/man/html/VK_NV_ray_tracing.html),
and the [GLSL NV Ray Tracing extension](https://github.com/KhronosGroup/GLSL/blob/master/extensions/nv/GLSL_NV_ray_tracing.txt).

### Shader Records and Parameters

In Vulkan, the parameters embedded in the shader record can only be 4-byte constants,
but do not require extra padding to 8-bytes as in DXR. The embedded parameters are
accessed in the shader through a special buffer type declared with the `shaderRecordNV` layout.
For example, if we wanted to pass a material ID for the geometry in the shader record
we could declare the buffer as follows:

```glsl
layout(shaderRecordNV) buffer SBTData {
    uint32_t material_id;
};
```

The size of the shader handles and alignment requirements for the shader records
are queried at runtime by querying the
[`VkPhysicalDeviceRayTracingPropertiesNV`](https://www.khronos.org/registry/vulkan/specs/1.1-extensions/man/html/VkPhysicalDeviceRayTracingPropertiesNV.html).
On my desktop with an RTX 2070 and Nvidia driver 441.12 the shader handle size
is 16 bytes and the shader record alignment requirement is 64 bytes.
The maximum allowed size for the shader record stride is 4096 bytes.

> Note: Parameters which are not 4-byte constants can be sent as well, along with buffer handles with
> buffer device address support (see [`vkGetBufferDeviceAddress`](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/vkGetBufferDeviceAddress.html))

### Instance Parameters

Instances in Vulkan are specified through the same structure layout as in DXR
(see [Vulkan Spec on Acceleration Structures](https://www.khronos.org/registry/vulkan/specs/1.1-extensions/html/vkspec.html#acceleration-structure)).
However, a definition is not provided in the headers and we must declare
our own struct which matches the specified layout:

```c++
struct GeometryInstance {
    float transform[12];
    uint32_t instance_custom_index : 24;
    uint32_t mask : 8;
    uint32_t instance_offset : 24;
    uint32_t flags : 8;
    uint64_t acceleration_structure_handle;
};
```

The parameters which affect the SBT indexing are:

- `instance_offset`: This sets the instance's SBT offset, \\(\mathbb{I}\_\text{offset}\\)
- `mask`: While the mask does not effect which hit group is called, it can
  be used to skip traversal of instances entirely, by masking them out of the traversal

### Trace Ray Parameters

In the ray generation, closest hit and miss shaders the function [traceNV](https://github.com/KhronosGroup/GLSL/blob/master/extensions/nv/GLSL_NV_ray_tracing.txt#L687-L697) from
the GLSL NV Ray Tracing extension can be called to trace rays.

```glsl
 void traceNV(accelerationStructureNV topLevel,
              uint rayFlags,
              uint cullMask,
              uint sbtRecordOffset,
              uint sbtRecordStride,
              uint missIndex,
              vec3 origin,
              float Tmin,
              vec3 direction,
              float Tmax,
              int payload);
```

traceNV takes the acceleration structure to trace against,
a set of ray flags to adjust the traversal being
performed, the instance mask, SBT indexing parameters, the ray parameters
and the index of the ray payload to be updated by the closest hit or miss shaders.
The parameters which effect the SBT indexing are:

- `cullMask`: This mask effects which instances are masked out by and'ing it
  with each instance's `mask`.
- `sbtRecordOffset`: This is the ray's SBT offset, \\(R\_\text{offset}\\).
- `sbtRecordStride`: This is the ray's SBT stride \\(R\_\text{stride}\\).
- `missIndex`: This is the miss shader index to call, \\(R\_\text{miss}\\).

In contrast to HLSL, the ray payloads are specified as a special shader input/output
variable, where the value of `payload` passed to traceNV selects which
one will be used. For example:

```glsl
struct RayPayload {
    vec3 hit_pos;
    vec3 normal;
};
layout(location = 0) rayPayloadNV RayPayload payload;
```

## Vulkan KHR Ray Tracing (added 5/1/2020)

For more documentation about the Vulkan KHR Ray Tracing extension, also see the
[extension specification](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VK_KHR_ray_tracing.html)
and the [GLSL EXT Ray Tracing extension](https://github.com/KhronosGroup/GLSL/blob/master/extensions/ext/GLSL_EXT_ray_tracing.txt).

### Shader Records and Parameters

In Vulkan, the parameters embedded in the shader record can be any data which could otherwise
be placed in a uniform buffer. The embedded parameters are
accessed in the shader through a special buffer type declared with the `shaderRecordEXT` layout.
For example, if we wanted to pass a material ID for the geometry in the shader record
we could declare the buffer as follows:

```glsl
layout(shaderRecordEXT) buffer SBTData {
    uint32_t material_id;
};
```

Buffer pointers can also be passed through the SBT in Vulkan, using the support for `vkGetBufferDeviceAddress`
(now core in 1.2) and the GLSL extension [`GL_EXT_buffer_reference2`](https://github.com/KhronosGroup/GLSL/blob/master/extensions/ext/GLSL_EXT_buffer_reference2.txt).
The `VkDeviceAddress` for a buffer can be written into the SBT, and accessed from GLSL by defining a buffer reference
buffer type.
The following closest hit shader example demonstrates this for accessing the index buffer data.
The example also makes use of [`GLSL_EXT_scalar_block_layout`](https://github.com/KhronosGroup/GLSL/blob/master/extensions/ext/GL_EXT_scalar_block_layout.txt)
for C-like struct layout in buffers.

```glsl
layout(buffer_reference, buffer_reference_align=8, scalar) buffer VertexBuffer {
    vec3 v[];
};

layout(buffer_reference, buffer_reference_align=8, scalar) buffer IndexBuffer {
    uvec3 i[];
};

layout(shaderRecordEXT, std430) buffer SBT {
    VertexBuffer verts;
    IndexBuffer indices;
};

void main() {
    const uvec3 idx = indices.i[gl_PrimitiveID];
    // ....
}
```

The size of the shader handles and alignment requirements for the shader records
are queried at runtime by querying the
[`VkPhysicalDeviceRayTracingPropertiesKHR`](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VkPhysicalDeviceRayTracingPropertiesKHR.html).
On my desktop with an RTX 2070 and Nvidia driver 442.81 the shader handle size
is 32 bytes and the shader record stride must be a multiple of 32 bytes.
The required alignment for the starting address of each table is 64 bytes.
The maximum allowed size for the shader record stride is 4096 bytes.
Note that this now matches the configuration of DXR, which was not the case with `NV_ray_tracing`.

### Instance Parameters

Instances in Vulkan are specified through the same structure layout as in DXR,
using the [`VkAccelerationStructureInstanceKHR`](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VkAccelerationStructureInstanceKHR.html)
struct.

```c++
struct VkAccelerationStructureInstanceKHR {
    VkTransformMatrixKHR transform;
    uint32_t instanceCustomIndex:24;
    uint32_t mask:8;
    uint32_t instanceShaderBindingTableRecordOffset:24;
    VkGeometryInstanceFlagsKHR flags:8;
    uint64_t accelerationStructureReference;
};
```

The parameters which affect the SBT indexing are:

- `instanceShaderBindingTableRecordOffset`: This sets the instance's SBT offset, \\(\mathbb{I}\_\text{offset}\\)
- `mask`: While the mask does not effect which hit group is called, it can
  be used to skip traversal of instances entirely, by masking them out of the traversal

### Trace Ray Parameters

In the ray generation, closest hit and miss shaders the function
[traceRayExt](https://github.com/KhronosGroup/GLSL/blob/master/extensions/ext/GLSL_EXT_ray_tracing.txt#L771-L781) from
`GLSL_EXT_ray_tracing` can be called to trace rays.

```glsl
void traceRayEXT(accelerationStructureEXT topLevel,
                 uint rayFlags,
                 uint cullMask,
                 uint sbtRecordOffset,
                 uint sbtRecordStride,
                 uint missIndex,
                 vec3 origin,
                 float Tmin,
                 vec3 direction,
                 float Tmax,
                 int payload);
```

traceRayEXT takes the acceleration structure to trace against,
a set of ray flags to adjust the traversal being
performed, the instance mask, SBT indexing parameters, the ray parameters
and the index of the ray payload to be updated by the closest hit or miss shaders.
The parameters which effect the SBT indexing are:

- `cullMask`: This mask effects which instances are masked out by and'ing it
  with each instance's `mask`.
- `sbtRecordOffset`: This is the ray's SBT offset, \\(R\_\text{offset}\\).
- `sbtRecordStride`: This is the ray's SBT stride \\(R\_\text{stride}\\).
- `missIndex`: This is the miss shader index to call, \\(R\_\text{miss}\\).

In contrast to HLSL, the ray payloads are specified as a special shader input/output
variable, where the value of `payload` passed to traceRayEXT selects which
one will be used. For example:

```glsl
struct RayPayload {
    vec3 hit_pos;
    vec3 normal;
};
layout(location = 0) rayPayloadEXT RayPayload payload;
```

## OptiX

For more documentation about OptiX see the
[OptiX 7 Programming Guide](https://raytracing-docs.nvidia.com/optix7/guide/index.html#introduction#)
and the [OptiX 7 Course](https://gitlab.com/ingowald/optix7course) from SIGGRAPH 2019.

### Shader Records and Parameters

In OptiX, the parameters embedded in the shader record can be arbitrary structs,
potentially containing CUDA device pointers or texture handles.
A pointer to the embedded parameters for the shader can be retrieved in the shader with by calling
`optixGetSbtDataPointer()`, which returns a `void*` to the portion of the SBT
after the shader handle.

The size of the shader handle is defined by `OPTIX_SBT_RECORD_HEADER_SIZE` (32 bytes),
the shader record alignment requirement is `OPTIX_SBT_RECORD_ALIGNMENT` (16 bytes).

### Instance Parameters

Instances in OptiX are specified through the [`OptixInstance`](https://raytracing-docs.nvidia.com/optix7/api/html/struct_optix_instance.html)
structure:

```c++
struct OptixInstance {
    float transform[12];
    unsigned int instanceId;
    unsigned int sbtOffset;
    unsigned int visibilityMask;
    unsigned int flags;
    OptixTraversableHandle traversableHandle;
    unsigned int pad[2];
};
```

The parameters which effect the SBT indexing are:

- `sbtOffset`: This sets the instance's SBT offset, \\(\mathbb{I}\_\text{offset}\\)
- `visibilityMask`: While the mask does not affect which hit group is called, it can
  be used to skip traversal of instances entirely, by masking them out of the traversal

### Trace Ray Parameters

In the ray generation, closest hit, and miss shaders the
[optixTrace](https://raytracing-docs.nvidia.com/optix7/api/html/group__optix__device__api.html)
function can be called to trace rays through the scene.

```c
void optixTrace(OptixTraversableHandle handle,
                float3 rayOrigin,
                float3 rayDirection,
                float tmin,
                float tmax,
                float rayTime,
                OptixVisibilityMask visibilityMask,
                unsigned int rayFlags,
                unsigned int SBToffset,
                unsigned int SBTstride,
                unsigned int missSBTIndex,
                // up to 8 32-bit values to be passed through registers
                // unsigned int& p0-p7
)
```

optixTrace takes the acceleration structure to trace against, a set of ray flags to adjust the traversal being
performed, the instance mask, SBT indexing parameters, the ray parameters, and up to 8 unsigned 32-bit values
that are passed by reference through registers to the closest hit and miss shaders. To pass a struct larger
than 32 bytes it's possible to pass a pointer to a stack variable in the calling shader
through by splitting it into two 32-bit ints, and then packing the pointer back together in the closest hit or miss shader.
The parameters which affect the SBT indexing are:

- `visibilityMask`: This mask affects which instances are masked out by and'ing it
  with each instance's `visibilityMask`.
- `SBToffset`: This is the ray's SBT offset, \\(R\_\text{offset}\\).
- `SBTstride`: This is the ray's SBT stride \\(R\_\text{stride}\\).
- `missSBTIndex`: This is the miss shader index to call, \\(R\_\text{miss}\\).

# Interactive SBT Builder

Now that we've discussed the how the SBT works and what parts of the SBT,
instance, and trace ray setup are similar or different between the RTX APIs,
let's do some hands-on activities! Using the interactive tool below
you can build a shader binding table, setup a scene,
set the trace ray parameters, and then see which hit groups are called for
the different geometries. Use this tool to explore different possible configurations
for the SBT, scene, and trace ray parameters to get a better understanding of how the different parameters
can be combined for different renderer and scene configurations.

Here are some suggested configurations to try setting up:

- A "standard ray tracer" as shown in Figure 2 with two ray types, primary and occlusion.
  Each geometry should have a hit group record for each ray type and there should be a miss
  record for each ray type.
- A [ray flags only]({{< ref 2019-09-06-faster-shadow-rays-on-rtx >}}) style ray tracer,
  with only primary ray hit groups for geometry, but both primary and occlusion miss shaders.
- A single hit group shared by all geometries. Note that different geometry's data
  can still be accessed in this mode by using the instance ID, and in DXR 1.1
  the [geometry index](https://devblogs.microsoft.com/directx/dxr-1-1/#geometryindex),
  to fetch data from global buffers.

## Shader Binding Table

Here you can add new hit and miss records with the buttons below, or remove them by double-clicking
the record. Click a record to select it and add or remove parameters.
Add parameters using the buttons below or double click a parameter to remove it.
When you select a hit group record the instance containing the geometry which would call the record
when hit by a ray for the current scene and trace ray setup is selected in the scene setup widget. If more than
one geometry share the same record, the first one will be highlighted.
The hit groups records which can be called by the currently selected instance in the scene
setup widget are highlighted in light blue.
The miss shader which will be called for the current trace ray call is also highlighted
in light purple.

You can also change the ray tracing API to see how the different handle sizes
and alignment requirements affect the SBT layout in memory. While it is also possible
to use separate buffers for the ray generation, hit group, and miss records I've kept
them all in one buffer here to simplify the visualization.

<div class="col-12">
    <svg width="100%" width="800" height="380" id="sbtWidget">
    </svg>
    <div class="col-12 row mb-2">
        <div class="col-12 mb-3">
            API: <select id="selectAPI" onchange="selectAPI()">
            <option selected="selected">DXR</option>
            <option>Vulkan NV Ray Tracing</option>
            <option>Vulkan KHR Ray Tracing</option>
            <option>OptiX</option>
            </select>
        </div>
        <div class="col-12">
            Dispatch/Launch Config:
            <ul>
            <li>Raygen Size: <span id='raygenSize'></span></li>
            <li>HitGroup start (\(\&HG[0]\)): <span id='hitGroupOffset'></span>, stride (\(\text{HG}_\text{stride}\)): <span id='hitGroupStride'></span></li>
            <li>Miss start: (\(\&M[0]\)): <span id='missOffset'></span>, stride (\(\text{M}_\text{stride}\)): <span id='missStride'></span></li>
            </ul>
        </div>
        <div class="col-6">
            <input type="text" class="form-control" id="shaderRecordName" placeholder="Shader record name">
        </div>
        <div class="col-6">
            <button id="addHitGroup" type="button" class="btn btn-primary" onclick="addShaderRecord('hitgroup')">Add Hit Group</button>
            <button id="addMissShader" type="button" class="btn btn-primary" onclick="addShaderRecord('miss')">Add Miss Shader</button>
        </div>
        <div class="col-12" id="dxrParamsUI">
            <p class="mt-2 mb-1">Shader Record Parameters:</p>
            <button id="addConstant" type="button" class="btn btn-primary" onclick="addConstantParam()">Add 4byte Constant</button>
            <button id="addGPUHandle" type="button" class="btn btn-primary" onclick="addGPUHandleParam()">Add GPU Handle</button>
        </div>
        <div class="col-12" id="vulkanParamsUI">
            <p class="mt-2 mb-1">Shader Record Parameters:</p>
            <button id="addConstant" type="button" class="btn btn-primary" onclick="addConstantParam()">Add 4byte Constant</button>
        </div>
        <div class="col-12" id="vulkanKHRParamsUI">
            <div class="col-12">
                <p class="mt-2 mb-1">Shader Record Parameters:</p>
            </div>
            <div class="col-12 row">
                <div class="col-6 mb-2">
                    <input type="number" class="form-control" id="shaderRecordEXT" min="0" placeholder="Shader record buffer size (bytes)"
                           oninput="addStructParam(this)">
                </div>
            </div>
        </div>
        <div class="col-12 row" id="optixParamsUI">
            <div class="col-12">
                <p class="mt-2 mb-1">Shader Record Parameters:</p>
            </div>
            <div class="col-12 row">
                <div class="col-6 mb-2">
                    <input type="number" class="form-control" id="structParamSize" min="0" placeholder="Struct size (bytes)"
                           oninput="addStructParam(this)">
                </div>
            </div>
        </div>
    </div>
</div>

## Scene Setup

Here you can setup the scene you want to trace rays against by adding or removing instances,
changing the number of geometries within instances, or changing each instance's mask.
To add an instance use the button below, to remove one double click on its BVH icon
or geometries. Select an instance by clicking on it to modify its SBT offset, number of geometries or
visibility mask with the inputs below. Setting \\(\mathbb{I}\_\text{offset}\\) to the recommended offset
will set it to match a configuration like that shown in Figure 2, using Equations 2 and 3.
The geometry ID (\\(\mathbb{G}\_\text{ID}\\)) of each geometry in the instance is displayed next to
the geometry in the widget. Although each geometry is represented with a Stanford Bunny icon, they
can each refer to unique mesh data.

The hit groups accessed by the selected instance will also be highlighted in light blue
in the shader binding table. Click a specific geometry in the scene to see the corresponding hit
group which will be called when intersected by a ray traced in the current trace ray call.
If a geometry would access an out of bounds hit group record for the current trace call,
it will be highlighted in red.
If a geometry in the instance potentially accesses an out of bounds hit group record (i.e., across the ray stride)
a warning will be displayed when it is selected.
Instances which are masked out of the current ray traversal will be grayed out.

<svg width="800" height="400" class="col-12" id="instanceWidget">
</svg>
<div class="col-12 row mb-2">
    <div class="col-4">
        <label for="geometryCount">Geometries</label>
        <input type="number" min="1" class="form-control" id="geometryCount" value="1"
               oninput="updateInstance()">
    </div>
    <div class="col-4">
        <label for="instanceSbtOffset">SBT Offset (\(\mathbb{I}_\text{offset}\))</label>
        <input type="number" min="0" class="form-control" id="instanceSbtOffset" value="0"
               oninput="updateInstance()">
    </div>
    <div class="col-4">
        <label for="instanceMask">Mask</label>
        <input type="text" class="form-control" id="instanceMask" value="ff"
               oninput="updateInstance()">
    </div>
    <div class="col-4 mt-2">
        <button id="addInstance" type="button" class="btn btn-primary" onclick="addInstance()">Add Instance</button>
    </div>
    <div class="col-4 mt-2">
        <button id="setTypicalSBTOffset" type="button" class="btn btn-primary" onclick="setInstanceSBTOffset()">
        Set Recommended Offset</button>
    </div>
    <div class="col-12 alert alert-danger mt-2" role="alert" id="hgOutOfBounds" style="display:none"></div>
</div>

## Trace Ray

Here you can setup your trace ray call to set the ray SBT offset, stride, and miss index.
After setting up the trace call click on geometries in the scene to see which hit group
will be called! The select miss shader button will select the miss shader which will be called
in the SBT widget above.

<div id="dxrTrace" class="col-12">
<div class="highlight"><pre tabindex="0" style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-hlsl" data-lang="hlsl"><span style="display:flex;"><span>TraceRay(accelerationStructure,
</span></span><span style="display:flex;"><span>    rayFlags,
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="instanceMaskVal">0xff</span>, <span style="color:#75715e">// Instance mask</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTOffsetVal">0</span>, <span style="color:#75715e">// Ray SBT offset</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTStrideVal">1</span>, <span style="color:#75715e">// Ray SBT stride</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="missShaderIndexVal">0</span>, <span style="color:#75715e">// Miss shader index</span>
</span></span><span style="display:flex;"><span>    ray,
</span></span><span style="display:flex;"><span>    payload);
</span></span></code></pre></div></div>

<div id="vulkanTrace" class="col-12">
<div class="highlight"><pre tabindex="0" style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-glsl" data-lang="glsl"><span style="display:flex;"><span>traceNV(accelerationStructure,
</span></span><span style="display:flex;"><span>    rayFlags,
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="instanceMaskVal">0xff</span>, <span style="color:#75715e">// Instance mask</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTOffsetVal">0</span>, <span style="color:#75715e">// Ray SBT offset</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTStrideVal">1</span>, <span style="color:#75715e">// Ray SBT stride</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="missShaderIndexVal">0</span>, <span style="color:#75715e">// Miss shader index</span>
</span></span><span style="display:flex;"><span>    rayOrigin
</span></span><span style="display:flex;"><span>    tmin
</span></span><span style="display:flex;"><span>    rayDirection,
</span></span><span style="display:flex;"><span>    tmax,
</span></span><span style="display:flex;"><span>    payloadIndex);
</span></span></code></pre></div>
</div>

<div id="vulkanKHRTrace" class="col-12">
<div class="highlight"><pre tabindex="0" style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-glsl" data-lang="glsl"><span style="display:flex;"><span>traceRayEXT(accelerationStructure,
</span></span><span style="display:flex;"><span>    rayFlags,
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="instanceMaskVal">0xff</span>, <span style="color:#75715e">// Instance mask</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTOffsetVal">0</span>, <span style="color:#75715e">// Ray SBT offset</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTStrideVal">1</span>, <span style="color:#75715e">// Ray SBT stride</span>
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="missShaderIndexVal">0</span>, <span style="color:#75715e">// Miss shader index</span>
</span></span><span style="display:flex;"><span>    rayOrigin
</span></span><span style="display:flex;"><span>    tmin
</span></span><span style="display:flex;"><span>    rayDirection,
</span></span><span style="display:flex;"><span>    tmax,
</span></span><span style="display:flex;"><span>    payloadIndex);
</span></span></code></pre></div>

</div>

<div id="optixTrace" class="col-12">
<div class="highlight"><pre tabindex="0" style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-cpp" data-lang="cpp"><span style="display:flex;"><span>optixTrace(accelerationStructure,
</span></span><span style="display:flex;"><span>    rayOrigin,
</span></span><span style="display:flex;"><span>    rayDirection,
</span></span><span style="display:flex;"><span>    tmin,
</span></span><span style="display:flex;"><span>    tmax,
</span></span><span style="display:flex;"><span>    rayTime,
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="instanceMaskVal">0xff</span>, <span style="color:#75715e">// Instance mask
</span></span></span><span style="display:flex;"><span><span style="color:#75715e"></span>    rayFlags,
</span></span><span style="display:flex;"><span>    <span style="color:#ae81ff" id="raySBTOffsetVal">0</span>, <span style="color:#75715e">// Ray SBT offset
</span></span></span><span style="display:flex;"><span><span style="color:#75715e"></span>    <span style="color:#ae81ff" id="raySBTStrideVal">1</span>, <span style="color:#75715e">// Ray SBT stride
</span></span></span><span style="display:flex;"><span><span style="color:#75715e"></span>    <span style="color:#ae81ff" id="missShaderIndexVal">0</span>, <span style="color:#75715e">// Miss shader index
</span></span></span><span style="display:flex;"><span><span style="color:#75715e"></span>    ... <span style="color:#75715e">// up to 8 32-bit values passed by reference through registers);
</span></span></span></code></pre></div>
</div>

<div class="col-12 row mb-2 mt-1">
    <div class="col-4">
        <label for="raySBTOffset">Ray SBT Offset (\(R_\text{offset}\))</label>
        <input type="number" min="0" class="form-control" id="raySBTOffset" value="0"
               oninput="updateTraceCall();">
    </div>
    <div class="col-4">
        <label for="raySBTStride">Ray SBT Stride (\(R_\text{stride}\))</label>
        <input type="number" min="0" class="form-control" id="raySBTStride" value="1"
               oninput="updateTraceCall();">
    </div>
    <div class="col-4">
        <label for="missShaderIndex">Miss Shader Index (\(R_\text{miss} \))</label>
        <input type="number" min="0" class="form-control" id="missShaderIndex" value="0"
               oninput="updateTraceCall();">
    </div>
    <div class="col-4">
        <label for="rayInstanceMask">Instance Visibility Mask</label>
        <input type="text" class="form-control" id="rayInstanceMask" value="ff"
               oninput="updateTraceCall();">
    </div>
    <div class="col-4 mt-4">
        <button id="showMissShader" type="button" class="btn btn-primary" onclick="showMissShader()">
        Select Miss Shader</button>
    </div>
    <div class="col-12 mt-2 alert alert-danger" role="alert" id="missOutOfBounds" style="display:none">
    </div>
</div>

# Extra: An SBT for Embree

Now that we've seen the similarities between the RTX API's shader binding table setup,
this leads us to an interesting question: If we wanted to write a unified programming model
for the RTX APIs, we'd implement something to wrap over the RTX
execution model and shader binding table, but what about the CPU?
On the CPU we can use [Embree](https://www.embree.org/)
to accelerate ray traversal to act as our "hardware-accelerated" API,
[ISPC](https://ispc.github.io/) as our SPMD programming language for vectorization,
and [TBB](https://github.com/intel/tbb) for multi-threading. However, the natural
way to write our CPU ray tracer differs significantly from how we'd write an RTX one, since we don't
have the rest of the RTX execution model, shader binding table, and so on. But since we're on
the CPU we have pretty much full control over how the code is setup and run,
so what if we just implemented the same execution model on top of Embree, ISPC, and TBB?

I've begun exploring exactly this idea in the [embree-sbt branch of ChameleonRT](https://github.com/Twinklebear/ChameleonRT/tree/embree-sbt/embree),
which now support enough features to re-implement my original Embree path tracer backend for
[ChameleonRT](https://github.com/Twinklebear/ChameleonRT/tree/master/embree) in this
Embree-SBT model (two ray types, shader record parameters, opaque geometry).
Since ISPC is somewhat similar to CUDA, I've followed
the OptiX style SBT in my implementation. The shader handles are just
ISPC function pointers which are passed a `void*` to the region
following the shader handle which contains any user-provided struct of embedded parameters.
On the ISPC side I provide a
[trace ray wrapper function](https://github.com/Twinklebear/ChameleonRT/blob/embree-sbt/embree/render_embree.ispc#L110-L146)
which calls `rtcIntersect` or `rtcOccluded` based on the ray flags and computes Equations 1 or 4
to determine which hit group or miss shader to call from the shader binding table.
What's really exciting to note here is that not only does this work,
but in my limited testing it actually seems to perform similar to or even slightly
better than my original implementation!

# Final Thoughts

Now that we've gotten an understanding of the RTX and SBT execution model and
even seen how this model can be successfully brought back to the CPU, we find ourselves
pointed in a pretty exciting direction. Although not discussed in this post,
the rest of the host-side RTX APIs (e.g., setting up geometries) are quite similar,
and we can implement anything we want on top of Embree to make it fit in.
The most challenging differences between the APIs to hide are the different
languages used to write the shaders (HLSL, GLSL, CUDA, ISPC),
the different ways the shader modules are setup, and how they receive parameters
embedded in the shader record and from global state. If we squint a little
bit the four languages are actually [very similar](https://github.com/Twinklebear/ChameleonRT/tree/hyperrender/kernels),
but we're still left with difficult differences to hide in how the host sets up
the shader modules and parameters, along with how those parameters are received by the shaders.

To unify these final differences it seems like what I
really need is a programming language similar to HLSL, GLSL, ISPC, and CUDA, but which
gives me enough information that I can hook up the shader record and global
parameters the user wants across all four APIs. The compiler would then output HLSL, GLSL,
ISPC, or CUDA as appropriate for the selected backend. Since the rest of the APIs are
so similar, I think this is not a big stretch to implement, but will take some careful API and
language design.
My end goal is to write a single host and device code path for my path tracer in [ChameleonRT](https://github.com/Twinklebear/ChameleonRT/)
which can run on all three RTX APIs and Embree. I've got to learn about compilers to do that, but watch this blog
or follow me on [Twitter](https://twitter.com/_wusher) for updates! If you have questions
or comments about this post, Twitter or email are the best ways to get in touch.

<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="/sbt.js"></script>
<!-- TODO: numbering may need update for Mathjax 3? -->
<script>
window.MathJax = {tex: { tags: "ams" }};
</script>
