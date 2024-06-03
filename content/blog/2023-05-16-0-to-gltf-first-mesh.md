---
layout: single
title: "From 0 to glTF with WebGPU: Rendering the First glTF Mesh"
description: ""
tags: [graphics, webgpu, gltf]
date: 2023-05-16
url: /graphics/2023/05/16/0-to-gltf-first-mesh

---

Now that we’ve seen how to draw a triangle in the [first post]({{< ref 2023-04-10-0-to-gltf-triangle >}}) and hook up camera controls so we can look around in the [second post]({{< ref 2023-04-11-0-to-gltf-bind-groups >}}), we’re at the point where the avocado really hits the screen and we can start drawing our first glTF primitives! I say the avocado hits the screen because that’s the glTF test model we’ll be using. You can grab it from the [Khronos glTF samples repo](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Avocado). glTF files come in two flavors (minus other extension specific versions), a standard “.gltf” version that stores the JSON header in one file and binary data and textures in separate files, and a “.glb” version, that combines the JSON header and all binary or texture data into a single file. We’ll be loading .glb files in this series to simplify how many files we have to deal with to get a model into the renderer, so grab the glTF-Binary [Avocado.glb](https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Avocado/glTF-Binary/Avocado.glb) and let’s get started!

{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/first-mesh-avocado.png"
  caption=`It takes quite a bit to get Avocado.glb on the screen, but this
    beautiful image of our expected final (and delicious) result should
    be enough motivation to keep us going!`
>}}

<!--more-->

# glTF Concepts

The glTF format was designed for efficient transfer of 3D content, and consists of a JSON part that describes the objects, and a binary part(s) containing the data for them. The binary data can be stored in separate binary files, embedded in the JSON as Base64, or in the case of glB (and the focus of this series), appended as binary in the same file following the JSON data. We’ll look at glB specifically in more detail later, but first we need to understand what’s in the JSON part of the glTF file that describes the scene.

I recommend taking a look through the [glTF 2.0 cheat sheet](https://www.khronos.org/files/gltf20-reference-guide.pdf), which is a great resource to get a quick overview of what’s in a glTF file. For even more details, check out the [glTF 2.0 spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html). The cheat sheet is excellent, but it might be a bit overwhelming since it covers everything that glTF supports, which is a lot! We’re going to be starting small for this post and just getting our first GLTFMesh on the screen, so we can ignore a lot of the file right now.

The sketch below is adapted from the glTF cheat sheet concepts sketch to just show the parts of the file that we’ll be looking at for this post: Meshes, Primitives, Accessors, BufferViews, and Buffers.

<!--![Screenshot 2023-05-15 at 11.32.04 AM.png](Parsing%20and%20Rendering%20the%20First%20Mesh%20from%20a%20glTF%20F%20811e35c0bfa44348b2bd78993a3e3fb2/Screenshot_2023-05-15_at_11.32.04_AM.png)-->
{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-concepts.svg"
caption="The GLTF concepts we'll be looking at in this post and their relationships. A mesh is made of multiple primitives. Primitives can reference multiple accessors that provide data for their attributes. Accessors provide type information for data referenced in buffer views. Buffer views reference regions of a binary buffer provided with the file."
>}}

The Meshes, Accessors, BufferViews and Buffers are all top-level objects in the JSON, as shown below for the Avocado.glb scene. The Scenes, Nodes, Cameras, Materials, Textures, Images, Samplers, Skins and Animations are also top-level JSON objects, but we won’t be looking into those yet. The Avocado includes a few of these objects, which you can see below.

To view the header of a glb file you can open it in a text editor, which will display the JSON part as readable text followed by a bunch of junk for the binary data. Alternatively, I wrote a small python script to print out the JSON part of a glb file to the console, you can download it [here](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/3-first-mesh/print_glb_header.py). [gltf.report](https://gltf.report/) is another useful site where you can explore the content of gltf/glb files.

```json
{
  "accessors": [
    ...
  ],
  "bufferViews": [
    ...
  ],
  "buffers": [
    ...
  ],
  "images": [
    ...
  ],
  "meshes": [
    {
      "primitives": [
        ...
      ],
      ...
    }
  ],
  "materials": [
    ...
  ],
  "nodes": [
    ...
  ],
  "scene": 0,
  "scenes": [
    ...
  ],
  "textures": [
    ...
  ]
}
```

Let’s take a look at the objects we’ll be loading for this post in a bit more detail. We’ll be using the Avocado.glb as the example here and work our way from the bottom to the top. We want to be able to load other files than just the Avocado, so we’ll also talk about possible properties of these objects that may not be used by the Avocado scene.

## Buffers

The buffers entry for a glb file is pretty straightforward. A glb file that doesn’t use any extensions will have a single binary buffer following the JSON data. The length of this buffer is specified in bytes, in the `byteLength` member of the Buffer object. glTF files using separate binary files or Base64 encoding can have multiple entries here, referring to different binary files or containing different Base64 encoded binary data. The buffer entry for the Avocado.glb is shown below.

```json
"buffers": [
  {
    "byteLength": 8326600
  }
],
```

## BufferViews

The binary data for our glTF file is packed into a single binary buffer which can contain vertex data, textures, etc. The buffer views are used to create virtual sub-buffers, or views, of this single large binary buffer to access specific vertex data, texture data, etc.

A bufferview must specify the buffer it references, `buffer`, and the size of the view in bytes, `byteLength`. The buffer view can optionally specify an offset from the start of the buffer that the view begins at, `byteOffset`, and the stride between elements in the buffer, `byteStride`. The `byteOffset` and `byteLength` together allow defining views of subregions of the buffer. The `byteStride` can be used to define a view containing interleaved data, for example a buffer that interleaves positions and normals for each vertex as position0, normal0, position1, normal1, etc. If the `byteStride` is not provided, the buffer is assumed to be tightly packed with elements of size defined by the accessor. Note that `byteStride` is required if multiple accessors reference a single buffer view.

There are some less common optional properties that can also be specified, see the [spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#buffers-and-buffer-views) for details.

The bufferview objects for the Avocado.glb are shown below. We don’t have interleaved buffers for the Avocado, but Khronos provides an [example](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/BoxInterleaved) if you’re curious.

```json
"bufferViews": [
  {
    "buffer": 0,
    "byteLength": 3158729
  },
  {
    "buffer": 0,
    "byteOffset": 3158729,
    "byteLength": 1655059
  },
  {
    "buffer": 0,
    "byteOffset": 4813788,
    "byteLength": 3489232
  },
  {
    "buffer": 0,
    "byteOffset": 8303020,
    "byteLength": 3248
  },
  {
    "buffer": 0,
    "byteOffset": 8306268,
    "byteLength": 4872
  },
  {
    "buffer": 0,
    "byteOffset": 8311140,
    "byteLength": 6496
  },
  {
    "buffer": 0,
    "byteOffset": 8317636,
    "byteLength": 4872
  },
  {
    "buffer": 0,
    "byteOffset": 8322508,
    "byteLength": 4092
  }
],
```

## Accessors

An accessor takes the data defined by a buffer view and specifies how it should be interpreted by the application. The accessor specifies the component type of the data, `componentType`, (e.g., int, float), the type of the elements, `type`, (scalar, vec2, vec3, etc.), and the number of elements, `count`. Accessors can optionally specify an additional offset, `byteOffset` , from the start of the referenced buffer view. More details about these parameters and optional ones can be found in the [spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessors).

The accessor offset can be used to apply an offset to access different elements in an interleaved buffer, or to apply an additional absolute offset to access a set of elements at some offset within the same buffer view. In WebGPU we have two options for how we pass the byte offset for a vertex attribute, and where we pass it will depend on whether the accessor is referring to interleaved data or is applying an additional absolute offset. For simplicity, later in this post we will pass it in the most generic location.

The illustration below shows an interleaved attribute buffer case. We have a single 32 byte buffer, within which is some interleaved vertex data containing a vec2 and scalar for each vertex. The file provides a buffer view specifying the offset to this data and the stride between elements (12 bytes). It then includes two accessors referencing this buffer view, one for the green vec2 attribute and one for the orange scalar attribute.

<!--![Screenshot 2023-05-15 at 3.24.04 PM.png](Parsing%20and%20Rendering%20the%20First%20Mesh%20from%20a%20glTF%20F%20811e35c0bfa44348b2bd78993a3e3fb2/Screenshot_2023-05-15_at_3.24.04_PM.png)-->
{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-accessors-interleaved.svg"
caption="Buffer, BufferView and Accessor configuration for a buffer storing interleaved vertex attributes."
>}}

The illustration below shows a case of using an accessor to apply an additional absolute offset. In this case, we again have a 32 byte buffer, but within the buffer is data containing position and normal data for a vertex. This data is specified as two vec3’s, which are not interleaved. Our buffer view can be made with the same parameters as above; however, our normal accessor now applies a larger byte offset to reach the desired region of the buffer view.

<!--![Screenshot 2023-05-15 at 3.27.31 PM.png](Parsing%20and%20Rendering%20the%20First%20Mesh%20from%20a%20glTF%20F%20811e35c0bfa44348b2bd78993a3e3fb2/Screenshot_2023-05-15_at_3.27.31_PM.png)-->
{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-accessors-absolute-offset.svg"
caption="Buffer, BufferView and Accessor configuration for a buffer storing packed vertex attributes. The accessor offset is used to access the normal vector attribute within the same buffer view."
>}}

It’s important to note that the two strategies can also be combined. We could have an interleaved buffer like the interleaved example, but use an accessor to apply both a large offset containing both the absolute and element offset to access some subregion of the buffer view. This is illustrated below, where we have accessors made specifically for the second elements in the interleaved case. These possibilities will impact our choice of how we specify the accessor offsets in WebGPU.

<!--![Screenshot 2023-05-15 at 3.35.38 PM.png](Parsing%20and%20Rendering%20the%20First%20Mesh%20from%20a%20glTF%20F%20811e35c0bfa44348b2bd78993a3e3fb2/Screenshot_2023-05-15_at_3.35.38_PM.png)-->
{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-accessors-interleaved-and-absolute-offset.svg"
caption="Buffer, BufferView and Accessor configuration for accessing interleaved vertex attribute data at an additional absolute offset within a buffer view."
>}}

Fortunately, the accessors for the Avocado are pretty simple. Each accessor references a different buffer view containing the packed elements for its data, as shown below.

```json
"accessors": [
  {
    "bufferView": 3,
    "componentType": 5126,
    "count": 406,
    "type": "VEC2"
  },
  {
    "bufferView": 4,
    "componentType": 5126,
    "count": 406,
    "type": "VEC3"
  },
  {
    "bufferView": 5,
    "componentType": 5126,
    "count": 406,
    "type": "VEC4"
  },
  {
    "bufferView": 6,
    "componentType": 5126,
    "count": 406,
    "type": "VEC3",
    "max": [
      0.02128091,
      0.06284806,
      0.0138090011
    ],
    "min": [
      -0.02128091,
      -4.773855e-05,
      -0.013809
    ]
  },
  {
    "bufferView": 7,
    "componentType": 5123,
    "count": 2046,
    "type": "SCALAR"
  }
],
```

## Meshes and Primitives

Finally, we can take a look at how meshes are specified in glTF. A mesh object itself is just a list of primitives, an optional name, and a few other optional parameters that we won’t need here (see the [spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-mesh)). The real work of specifying the geometry for a mesh is done by its primitives.

The primitives array of the mesh specifies the different geometric primitives that make up the mesh. The attributes for each primitive maps each attribute’s name to an accessor that provides the data. The `POSITION` attribute is required, other optional attributes are defined by the [spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes) and applications can also add custom attributes as well. A list of vertex indices for indexed rendering can be provided by specifying the accessor referencing the index data. Each primitive can also specify a material and topology mode (e.g., points, lines, triangles), along with other [optional parameters](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-mesh-primitive).

The meshes for the Avocado are listed below. The Avocado contains a single primitive, who’s `POSITION` attribute references accessor 3. This accessor (above) provides vec3 float data (this format is required by the spec) for the vertex positions.

```json
"meshes": [
  {
    "primitives": [
      {
        "attributes": {
          "TEXCOORD_0": 0,
          "NORMAL": 1,
          "TANGENT": 2,
          "POSITION": 3
        },
        "indices": 4,
        "material": 0
      }
    ],
    "name": "Avocado"
  }
],
```

# Anatomy of a Binary glTF File (glb)

Typical glTF files separate the JSON and binary data into different files, requiring multiple network requests or disk accesses to load the data. The glB format was designed to address this issue, by combining the JSON header and all binary data into a single file. This combination has the added benefit of making the data easier to manage as well, as we only need to keep track of one file. However, it also means we need to do a bit more byte-level access when reading the data so that we can properly access the JSON and binary data for the file.

A glb is required to contain a JSON chunk followed by a binary chunk, in that order ([spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#glb-file-format-specification)). Additional chunks for extensions can follow the binary chunk, if needed.

Visually, a binary glTF file as shown below

<!--![Screenshot 2023-05-15 at 4.31.04 PM.png](Parsing%20and%20Rendering%20the%20First%20Mesh%20from%20a%20glTF%20F%20811e35c0bfa44348b2bd78993a3e3fb2/Screenshot_2023-05-15_at_4.31.04_PM.png)-->
{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/glb-layout.svg"
caption="The glb file layout."
>}}

The first 12 bytes are the glb header, used to identify the file as glb file and specify its total length in bytes (including all headers, JSON, binary). The JSON chunk starts at 12 bytes, and includes a chunk header specifying its length and type, followed by a JSON string. The JSON string will occupy bytes 20 to 20 + jsonChunkLength. The binary chunk follows at byte 20 + jsonChunkLength, and contains its own header specifying the binary chunk length and type, followed by the binary data for the file.

# Parsing a glTF Mesh from a glB File

Now that we’re familiar with the parts of the glTF file we need and know how to read a binary glTF file, we’re ready to load up a glb file and import the data to render our Avocado! We’re going to start with simply loading the primitives for the first mesh we find in the file. This will work for our Avocado and a number of other simple single-mesh glTF files available in the Khronos test model repo and online.

We’ll load the file from bottom to top, in the same order that we discussed the components in detail above. The final `uploadGLB` function and supporting classes can be found in the repo on [GitHub](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/3-first-mesh/src/glb.js).

## Reading the Header

First, we need to read the glb header, load the JSON chunk, and create a buffer corresponding to the binary chunk. Our function `uploadGLB` takes an ArrayBuffer, `buffer`, containing the glb file data, and the WebGPU Device, `device`, to upload the data to.

First, we create a `Uint32Array` over the glb file data that contains both the glb header and JSON chunk header.

```jsx
export function uploadGLB(buffer, device) {
    // glB has a JSON chunk and a binary chunk, potentially followed by
    // other chunks specifying extension specific data, which we ignore
    // since we don't support any extensions.
    // Read the glB header and the JSON chunk header together 
    // glB header:
    // - magic: u32 (expect: 0x46546C67)
    // - version: u32 (expect: 2)
    // - length: u32 (size of the entire file, in bytes)
    // JSON chunk header
    // - chunkLength: u32 (size of the chunk, in bytes)
    // - chunkType: u32 (expect: 0x4E4F534A for the JSON chunk)
    var header = new Uint32Array(buffer, 0, 5);
    // Validate glb file contains correct magic value
    if (header[0] != 0x46546C67) {
        throw Error("Provided file is not a glB file")
    }
    if (header[1] != 2) {
        throw Error("Provided file is glTF 2.0 file");
    }
    // Validate that first chunk is JSON
    if (header[4] != 0x4E4F534A) {
        throw Error("Invalid glB: The first chunk of the glB file is not a JSON chunk!");
    }

    // Decode the JSON chunk of the glB file to a JSON object
    var jsonChunk =
        JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(buffer, 20, header[3])));

    // Read the binary chunk header
    // - chunkLength: u32 (size of the chunk, in bytes)
    // - chunkType: u32 (expect: 0x46546C67 for the binary chunk)
    var binaryHeader = new Uint32Array(buffer, 20 + header[3], 2);
    if (binaryHeader[1] != 0x004E4942) {
        throw Error("Invalid glB: The second chunk of the glB file is not a binary chunk!");
    }
```

## Reading the Buffer and BufferViews

We’ll introduce two classes, `GLTFBuffer` and `GLTFBufferView` to represent the gltf buffer and buffer view objects in our app.

First we can create the `GLTFBuffer`. Although the glb spec allows the JSON to reference other external buffers in addition to the single embedded buffer, we’re targeting just the simple and common use case that there’s a single buffer which is the binary chunk.

The `GLTFBuffer` class is a straightforward mapping of the GLTF buffer object. We create a new `Uint8Array` view over the glb buffer passed to the constructor at the binary chunk’s starting offset with the binary chunk’s size.

```jsx
// in glb.js, outside uploadGLB
export class GLTFBuffer {
    constructor(buffer, offset, size) {
        this.buffer = new Uint8Array(buffer, offset, size);
    }
}
```

We can then create a `GLTFBuffer` referencing the data in the binary chunk

```jsx
// within uploadGLB
// Make a GLTFBuffer that is a view of the entire binary chunk's data,
// we'll use this to create buffer views within the chunk for memory referenced
// by objects in the glTF scene
var binaryChunk = new GLTFBuffer(buffer, 28 + header[3], binaryHeader[0]);
```

The next object we need to read are the buffer views, which we represent with the `GLTFBufferView` class. The constructor for `GLTFBufferView` makes a new `Uint8Array` view over just the region of the binary chunk that the view covers. Note that the `subarray` API creates a view over the underlying `ArrayBuffer`, it does not make a copy. Another design choice here is that we don’t need to track the offset for buffer views after creating the view, because this offset is baked into the view object we create in the constructor.

The `GLTFBufferView` provides two additional methods, `addUsage` and `upload`. The latter is self-descriptive, it creates a GPU buffer and upload the buffer view to it. The `addUsage` method is used when parsing the rest of the scene data to ensure that the GPU buffer we create will have the correct usage flags set for it, e.g., to allow binding it as a vertex or index buffer.

We also track a flag `needsUpload` to determine which buffer views actually need to be uploaded to the GPU. Image data is also access through buffer views in glb files, however we don’t need to upload the PNG or JPG binary data to the GPU since we will instead decode it to a texture. When parsing the rest of the scene we’ll flag buffers that need to be uploaded to the GPU so that we can upload just what we need.

```jsx
// in glb.js, outside uploadGLB
export class GLTFBufferView {
    constructor(buffer, view) {
        this.length = view["byteLength"];
        this.byteStride = 0;
        if (view["byteStride"] !== undefined) {
            this.byteStride = view["byteStride"];
        }

        // Create the buffer view. Note that subarray creates a new typed
        // view over the same array buffer, we do not make a copy here.
        var viewOffset = 0;
        if (view["byteOffset"] !== undefined) {
            viewOffset = view["byteOffset"];
        }
        this.view = buffer.buffer.subarray(viewOffset, viewOffset + this.length);

        this.needsUpload = false;
        this.gpuBuffer = null;
        this.usage = 0;
    }

    // When this buffer is referenced as vertex data or index data we
    // add the corresponding usage flag here so that the GPU buffer can
    // be created properly.
    addUsage(usage) {
        this.usage = this.usage | usage;
    }

    // Upload the buffer view to a GPU buffer
    upload(device) {
        // Note: must align to 4 byte size when mapped at creation is true
        var buf = device.createBuffer({
            size: alignTo(this.view.byteLength, 4),
            usage: this.usage,
            mappedAtCreation: true
        });
        new (this.view.constructor)(buf.getMappedRange()).set(this.view);
        buf.unmap();
        this.gpuBuffer = buf;
        this.needsUpload = false;
    }
}
```

Next we can loop through the bufferViews specified in the JSON chunk and create corresponding `GLTFBufferView` objects for them. The buffer view constructor takes the buffer to make a view over and the JSON object describing the buffer view being created.

```jsx
// within uploadGLB
// Create GLTFBufferView objects for all the buffer views in the glTF file
var bufferViews = [];
for (var i = 0; i < jsonChunk.bufferViews.length; ++i) {
    bufferViews.push(new GLTFBufferView(binaryChunk, jsonChunk.bufferViews[i]));
}
```

At the end of `uploadGLB`, after we’ve loaded all the meshes and scene objects, we loop through the buffer views and upload those that need to be uploaded to the GPU based on which ones were marked as `needsUpload` during the scene loading step.

```jsx
// at the end of uploadGLB before returning the mesh
// Upload the buffer views used by mesh
for (var i = 0; i < bufferViews.length; ++i) {
    if (bufferViews[i].needsUpload) {
        bufferViews[i].upload(device);
    }
}
```

## Reading the Accessors

The next object up the chain are accessors, which we represent with the `GLTFAccessor` class shown below. The constructor takes the `GLTFBufferView` and the JSON object describing the accessor and constructs the object. The object is a direct mapping of the JSON accessor data, with the addition of storing a reference to the buffer view instead of just an index to it.

The accessor also provides a utility getter, `byteStride` , to compute the stride in bytes between elements referenced by the accessor. If the buffer view specifies a byte stride we use this stride, otherwise the elements are assumed to be packed and we use the size of the accessor type as the stride. If not byte stride is specified for the buffer view it will default to 0, thus we pick between the two with a max.

The utility functions `gltfTypeSize` and `gltfVertexType` are omitted from the post to keep it focused, these can be found on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/3-first-mesh/src/glb.js).

```jsx
// in glb.js, outside uploadGLB
export class GLTFAccessor {
    constructor(view, accessor) {
        this.count = accessor["count"];
        this.componentType = accessor["componentType"];
        this.gltfType = parseGltfType(accessor["type"]);
        this.view = view;
        this.byteOffset = 0;
        if (accessor["byteOffset"] !== undefined) {
            this.byteOffset = accessor["byteOffset"];
        }
    }

    get byteStride() {
        var elementSize = gltfTypeSize(this.componentType, this.gltfType);
        return Math.max(elementSize, this.view.byteStride);
    }

    get byteLength() {
        return this.count * this.byteStride;
    }

    // Get the vertex attribute type for accessors that are
    // used as vertex attributes
    get vertexType() {
        return gltfVertexType(this.componentType, this.gltfType);
    }
}
```

Back within `uploadGLB`, we can create the accessors after the loop creating the buffer views. The process is the same, we loop through the JSON data describing the accessors and create the objects, passing the referenced buffer view and the accessor JSON object to the constructor.

```jsx
// within uploadGLB
// Create GLTFAccessor objects for the accessors in the glTF file
// We need to handle possible errors being thrown here if a model is using
// accessors for types we don't support yet. For example, a model with animation
// may have a MAT4 accessor, which we currently don't support.
var accessors = [];
for (var i = 0; i < jsonChunk.accessors.length; ++i) {
    var accessorInfo = jsonChunk.accessors[i];
    var viewID = accessorInfo["bufferView"];
    accessors.push(new GLTFAccessor(bufferViews[viewID], accessorInfo));
}
```

## Reading the Mesh’s Primitives

With the accessors, buffer views, and buffers in place we can now load our mesh’s primitives. We’ll represent each primitive with the `GLTFPrimitive` class shown below. We’re just going to render the mesh geometry to start, and ignore any additional attributes. The `GLTFPrimitive` constructor takes the accessors for the vertex indices and positions, and the rendering topology (triangles, triangle strip, etc.). We’ll also start by only supporting triangles or triangle strips.

In the constructor we also mark the required buffer usages for the views and mark them as needing upload to the GPU so that our primitive can use the data during rendering. If indices are provided for the primitive we must add the index buffer usage flag to the underlying buffer view. Similarly, we must add the vertex buffer usage flag to the accessor’s buffer view. The index and vertex buffers will need to be uploaded to the GPU, and 

The `GLTFPrimitive` has two methods that we’ll use later for rendering, `buildRenderPipeline` and `render`. We’ll look at those in detail later when we get to rendering our mesh.

```jsx
// in glb.js, outside uploadGLB
export class GLTFPrimitive {
    constructor(positions, indices, topology) {
        this.positions = positions;
        this.indices = indices;
        this.topology = topology;
        this.renderPipeline = null;
        // Set usage for the positions data and flag it as needing upload
        this.positions.view.needsUpload = true;
        this.positions.view.addUsage(GPUBufferUsage.VERTEX);

        if (this.indices) {
            // Set usage for the indices data and flag it as needing upload
            this.indices.view.needsUpload = true;
            this.indices.view.addUsage(GPUBufferUsage.INDEX);
        }
    }

    buildRenderPipeline(device,
                        shaderModule,
                        colorFormat,
                        depthFormat,
                        uniformsBGLayout)
    {
        // More on this later!
    }

    render(renderPassEncoder, uniformsBG) {
        // More on this later!
    }
}
```

The `GLTFMesh` class is pretty simple. It just takes the name of the mesh and the list of primitives that make up the mesh.

```jsx
// in glb.js, outside uploadGLB
export class GLTFMesh {
    constructor(name, primitives) {
        this.name = name;
        this.primitives = primitives;
    }

    buildRenderPipeline(device,
                        shaderModule,
                        colorFormat,
                        depthFormat,
                        uniformsBGLayout)
    {
        // More on this later!
    }

    render(renderPassEncoder, uniformsBG) {
        // More on this later!
    }
}
```

With everything in place we can now load the GLTF primitives and the mesh from the file. In this post we’re just going to load the first mesh defined in the file, so we take `jsonChunk.meshes[0]` and then loop through its primitives to create the `GLTFPrimitive` objects. Another restriction we’ll have is that we only support triangles and triangle trip topologies for now. Our primitive importing loop will throw an error if we encounter an unsupported primitive type for now.

To create each primitive we then need to find the accessors for its indices (if provided) and vertex positions (required). The indices are provided as a distinct member of the primitive’s JSON object, while the positions are listed in the primitive attributes map as the `POSITION` attribute. The `POSITION` attribute is required by the glTF spec to be provided.

Once we’ve imported all the primitives we can create the mesh. The `GLTFRenderMode` constants are omitted for brevity, and can be found on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/3-first-mesh/src/glb.js).

```jsx
// within uploadGLB
// Load the first mesh
var mesh = jsonChunk.meshes[0];
var meshPrimitives = [];
// Loop through the mesh's primitives and load them
for (var i = 0; i < mesh.primitives.length; ++i) {
    var prim = mesh.primitives[i];
    var topology = prim["mode"];
    // Default is triangles if mode specified
    if (topology === undefined) {
        topology = GLTFRenderMode.TRIANGLES;
    }
    if (topology != GLTFRenderMode.TRIANGLES &&
        topology != GLTFRenderMode.TRIANGLE_STRIP) {
        throw Error(`Unsupported primitive mode ${prim["mode"]}`);
    }

    // Find the vertex indices accessor if provided
    var indices = null;
    if (jsonChunk["accessors"][prim["indices"]] !== undefined) {
        indices = accessors[prim["indices"]];
    }

    // Loop through all the attributes to find the POSITION attribute.
    // While we only want the position attribute right now, we'll load
    // the others later as well.
    var positions = null;
    for (var attr in prim["attributes"]) {
        var accessor = accessors[prim["attributes"][attr]];
        if (attr == "POSITION") {
            positions = accessor;
        }
    }

    // Add the primitive to the mesh's list of primitives
    meshPrimitives.push(new GLTFPrimitive(positions, indices, topology));
}
// Create the GLTFMesh
var mesh = new GLTFMesh(mesh["name"], meshPrimitives);
```

Finally, before we return the mesh we loaded we have to loop through the buffer views and upload any that were marked as “needs upload” to the GPU so that the data will be available during rendering.

```jsx
// at the end of uploadGLB
// Upload the buffers as mentioned above before returning the mesh
// Upload the buffer views used by mesh
for (var i = 0; i < bufferViews.length; ++i) {
    if (bufferViews[i].needsUpload) {
        bufferViews[i].upload(device);
    }
}

return mesh;
```

# Rendering the Mesh

We’ve put in a lot of work getting our mesh data loaded from the glb file, but we’re almost there! To render the mesh we need to render each of its primitives. To render each primitive we’re going to implement the two methods we saw earlier: `GLTFPrimitive.buildRenderPipeline` , responsible for creating the rendering pipeline for the primitive, and `GLTFPrimitive.render` , which will encode the rendering commands for the primitive.

You might be wondering, “won’t this be really inefficient for large scenes where my GLTF file has 100’s-1000’s (or more) primitives?”, and you’re right! Creating a rendering pipeline for each individual primitive is not a scalable approach. We’ll come back to how we can optimize this simple approach in a later post, but it’s enough to get us started for now.

## Building a Render Pipeline for Each Primitive

First we need to build a render pipeline for each primitive. This is done in the `GLTFPrimitive.buildRenderPipeline` method, shown below. To allow some re-use across primitives we will use the same shader for all of them, as right now we don’t need to handle differences in attributes or material usage between primitives. This is passed as the `shaderModule` parameter. We’ll also be sharing the same uniform buffer containing the camera parameters across all primitives, this bind group layout is passed as the `uniformsBGLayout` . We also need the output color format and depth formats to build the render pipeline. The app rendering our primitive passes these through to us as `colorFormat` and `depthFormat` respectively.

The setup here is actually not that different from the previous posts. The main changes are that we now use the positions accessor’s `byteStride` as the vertex attribute array stride, and compute the vertex type for it from the accessor’s type. It’s worth noting that for GLTF, the `POSITION` attribute must always be `float32x3`.

A key point here is that we do not pass the position accessor’s `byteOffset` as the attribute offset in the vertex state. In WebGPU, there are two ways to pass a byte offset for a vertex attribute. It can either be set in the vertex state, where it is treated as an offset within `arrayStride` for accessing interleaved attributes, or as a global offset applied to the buffer when calling `setVertexBuffer`. The attribute offset set in the vertex state is specifically for interleaved attributes, and thus WebGPU requires that `offset + sizeof(format)` is less than the `arrayStride` of the buffer. However, the offset applied in `setVertexBuffer` has no such restriction, as it applies an absolute offset in bytes from the start of the buffer. Passing the offset in `setVertexBuffer` doesn’t prevent us from supporting interleaved attributes, but it does mean we need to bind the same buffer twice. Since we’re only supporting one attribute right now anyways, the position, we’ll simply apply the offset in `setVertexBuffer`to simplify handling the different offset size possibilities in GLTF.

The last change difference is that, if we’re rendering a triangle strip, WebGPU requires us to include the index format as part of the pipeline.  This is handled when creating the `primitive` object for the pipeline descriptor.

```jsx
// in glb.js GLTFPrimitive.buildRenderPipeline implementation
buildRenderPipeline(device,
                    shaderModule,
                    colorFormat,
                    depthFormat,
                    uniformsBGLayout)
{
    // Vertex attribute state and shader stage
    var vertexState = {
        // Shader stage info
        module: shaderModule,
        entryPoint: "vertex_main",
        // Vertex buffer info
        buffers: [{
            arrayStride: this.positions.byteStride,
            attributes: [
                // Note: We do not pass the positions.byteOffset here, as its
                // meaning can vary in different glB files, i.e., if it's
                // being used for interleaved element offset or an absolute
                // offset.
                {
                    format: this.positions.vertexType, 
                    offset: 0,
                    shaderLocation: 0
                }
            ]
        }]
    };
  
    var fragmentState = {
        // Shader info
        module: shaderModule,
        entryPoint: "fragment_main",
        // Output render target info
        targets: [{format: colorFormat}]
    };
  
    // Our loader only supports triangle lists and strips, so by default we set
    // the primitive topology to triangle list, and check if it's
    // instead a triangle strip
    var primitive = {topology: "triangle-list"};
    if (this.topology == GLTFRenderMode.TRIANGLE_STRIP) {
        primitive.topology = "triangle-strip";
        primitive.stripIndexFormat = this.indices.vertexType;
    }
  
    var layout = device.createPipelineLayout({
        bindGroupLayouts: [uniformsBGLayout]
    });
  
    this.renderPipeline = device.createRenderPipeline({
        layout: layout,
        vertex: vertexState,
        fragment: fragmentState,
        primitive: primitive,
        depthStencil: {
            format: depthFormat,
            depthWriteEnabled: true,
            depthCompare: "less"
        }
    });
}
```

## Rendering Each Primitive

Now we can use our rendering pipeline in `GLTFPrimitive.render` to render our primitive! The render method takes as input a render pass encoder to encode our rendering commands into and the global uniforms bindgroup to bind.

The rendering process is similar to what we’ve seen in previous posts, with the main changes being that we need to set the accessor’s byte offset and length when binding the vertex buffer, and potentially use an index buffer for indexed rendering. When binding the index buffer we must also apply its accessor’s byte offset and length.

Then we can draw our primitive!

```jsx
// in glb.js GLTFPrimitive.render implementation
render(renderPassEncoder, uniformsBG) {
    renderPassEncoder.setPipeline(this.renderPipeline);
    renderPassEncoder.setBindGroup(0, uniformsBG);

    // Apply the accessor's byteOffset here to handle both global and interleaved
    // offsets for the buffer. Setting the offset here allows handling both cases,
    // with the downside that we must repeatedly bind the same buffer at different
    // offsets if we're dealing with interleaved attributes.
    // Since we only handle positions at the moment, this isn't a problem.
    renderPassEncoder.setVertexBuffer(0,
        this.positions.view.gpuBuffer,
        this.positions.byteOffset,
        this.positions.byteLength);

    if (this.indices) {
        renderPassEncoder.setIndexBuffer(this.indices.view.gpuBuffer,
            this.indices.vertexType
            this.indices.byteOffset,
            this.indices.byteLength);
        renderPassEncoder.drawIndexed(this.indices.count);
    } else {
        renderPassEncoder.draw(this.positions.count);
    }
}
```

## Putting it Together to Render the Entire Mesh

The `GLTFMesh` versions of `buildRenderPipeline` and `render` are straightforward. We’ve delegated all the work to the primitives, where the actual geometry data lives, so the mesh just loops through its primitives and calls the respective functions.

```jsx
// in glb.js GLTFMesh.buildRenderPipeline and GLTFMesh.render implementations
buildRenderPipeline(device,
                    shaderModule,
                    colorFormat,
                    depthFormat,
                    uniformsBGLayout)
{
    // We take a pretty simple approach to start. Just loop through
    // all the primitives and build their respective render pipelines
    for (var i = 0; i < this.primitives.length; ++i) {
        this.primitives[i].buildRenderPipeline(device,
            shaderModule,
            colorFormat,
            depthFormat,
            uniformsBGLayout);
    }
}

render(renderPassEncoder, uniformsBG) {
    // We take a pretty simple approach to start. Just loop through
    // all the primitives and call their individual draw methods
    for (var i = 0; i < this.primitives.length; ++i) {
        this.primitives[i].render(renderPassEncoder, uniformsBG);
    }
}
```

# Rendering a glTF Mesh in our App!

With all that done, we’re ready to get the Avocado on the screen! To render the glb file we’re going to need to fetch it from the network or have the user upload it through a form, then set up its render pipeline(s) and render it. Most of our application code is the same as the previous post, with the changes that we can remove the triangle buffers and render pipeline. For the full app code, see [app.js on Github](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/3-first-mesh/src/app.js).

## Loading a glb File from the Network or the User

To render a glb file we need to get one into our app, either by fetching it over the network or letting users of the app upload their own files to try out. I’ve packed the Avocado.glb file in the [lesson repo](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/3-first-mesh/src) and have used [webpack](https://webpack.js.org/) to bundle everything into an app. At the top of app.js we import it with webpack:

```jsx
// top of app.js in the imports section
import avocadoGlb from "./Avocado.glb";
```

Then after we’ve setup our shader module, bind group layout, swapchain, etc. as before we can fetch the file, load it and build the render pipeline.

```jsx
// in the async lambda in app.js
// Load the packaged GLB file, Avocado.glb
var glbMesh = await fetch(avocadoGlb)
    .then(res => res.arrayBuffer()).then(buf => uploadGLB(buf, device));

glbMesh.buildRenderPipeline(device,
    shaderModule,
    swapChainFormat,
    depthFormat,
    bindGroupLayout);
```

I’ve also included a file upload form in the example app so users can upload their own glb files to try out. To support that we find the file upload form by its id and attach an `onchange` listener

```jsx
// in the async lambda in app.js
// Setup onchange listener for file uploads
document.getElementById("uploadGLB").onchange =
    function () {
        var reader = new FileReader();
        reader.onerror = function () {
            throw Error("Error reading GLB file");
        };
        reader.onload = function () {
            glbMesh = uploadGLB(reader.result, device)
            glbMesh.buildRenderPipeline(device,
                shaderModule,
                swapChainFormat,
                depthFormat,
                bindGroupLayout);
        };
        if (this.files[0]) {
            reader.readAsArrayBuffer(this.files[0]);
        }
    };
```

## Coloring the Mesh by Geometry Normal

In the previous posts we passed position and color data through as vertex attributes to make our triangle look a bit more interesting. However, we now only have position data for our mesh file and need to update our shader vertex inputs. We could just color it by a solid color, but it will be hard to see the surface details of the meshes to tell if we’ve loaded them properly.

Instead, we can compute the geometry normal on the fly in the fragment shader by computing fragment derivatives on the world space position of the object. We can take the derivative of the position along the x and y axes and compute the cross product to find the normal. After normalizing it, the normal will be in the `[-1, 1]` range, which we can rescale into `[0, 1]` for use as a color.

Our updated shader code is shown below. We’ve removed the `color` attribute from the `VertexInput` struct to match the render pipeline, which now only provides position data. The position data also comes in as a `float3` from gltf, so we’ve changed the type of `position` as well. To compute the geometry normal in the fragment shader we now output the world space position from the vertex shader in the `VertexOutput` member. The fragment shader then computes fragment derivatives of `world_pos` to compute the normal.

```glsl
alias float4 = vec4<f32>;
alias float3 = vec3<f32>;

struct VertexInput {
    @location(0) position: float3,
};

struct VertexOutput {
    @builtin(position) position: float4,
    @location(0) world_pos: float3,
};

struct ViewParams {
    view_proj: mat4x4<f32>,
};

@group(0) @binding(0)
var<uniform> view_params: ViewParams;

@vertex
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = view_params.view_proj * float4(vert.position, 1.0);
    out.world_pos = vert.position.xyz;
    return out;
};

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) float4 {
    // Compute the normal by taking the cross product of the
    // dx & dy vectors computed through fragment derivatives
    let dx = dpdx(in.world_pos);
    let dy = dpdy(in.world_pos);
    let n = normalize(cross(dx, dy));
    return float4((n + 1.0) * 0.5, 1.0);
}
```

## Rendering the Mesh

The rest of our render pass and camera setup is the same as before. The Avocado mesh location is a bit different than the triangle we were rendering earlier, so I tweaked the camera parameters a bit to start it in a better position.

```jsx
// in the async lambda in app.js
// Adjust camera position and near/far plans to have a better view
// of the Avocado when it's loaded
var camera =
    new ArcballCamera([0, 0, 0.2], [0, 0, 0], [0, 1, 0],
                      0.5, [canvas.width, canvas.height]);
var proj = mat4.perspective(
    mat4.create(), 50 * Math.PI / 180.0,
    canvas.width / canvas.height, 0.01, 1000);
```

Our render loop is the same as before, we wait for the `animationFrame` promise, update the view parameters, and start encoding a render pass. Then we simply call `glbMesh.render` to render our mesh.

```jsx
// in the async lambda in app.js
// Render!
while (true) {
    await animationFrame();

    // Update camera buffer
    projView = mat4.mul(projView, proj, camera.camera);

    var upload = device.createBuffer(
        {size: 16 * 4, usage: GPUBufferUsage.COPY_SRC, mappedAtCreation: true});
    {
        var map = new Float32Array(upload.getMappedRange());
        map.set(projView);
        upload.unmap();
    }

    renderPassDesc.colorAttachments[0].view =
        context.getCurrentTexture().createView();

    var commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(upload, 0, viewParamsBuffer, 0, 16 * 4);

    var renderPass = commandEncoder.beginRenderPass(renderPassDesc);

    // Render our mesh!
    glbMesh.render(renderPass, viewParamBG);

    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
}
```

# Result

Finally after all that work, we’ve got our Avocado on the screen! I’ve embedded the app below as an iframe so you can try it out. You can also grab the code on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/3-first-mesh) to run it locally or view it [online directly](https://www.willusher.io/webgpu-0-to-gltf-demos/3-first-mesh/).

Feel free to ask any questions or post comments about the post on the [GitHub discussion board](https://github.com/Twinklebear/webgpu-0-to-gltf/discussions/2).

<div class="ratio ratio-4x3">
<iframe src="https://www.willusher.io/webgpu-0-to-gltf-demos/3-first-mesh/index.html"></iframe>
</div>

