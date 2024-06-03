---
layout: single
title: "From 0 to glTF with WebGPU: Basic Materials and Textures"
tags: [graphics, webgpu, gltf]
date: 2024-04-28
url: /graphics/2024/04/28/0-to-gltf-basic-materials

---

{{< numbered_fig
src="https://willusherio.b-cdn.net/webgpu-0-to-gltf/basic-material-textures-ts-duck.png"
caption="The happy duck we’ll be able to render at the end of this post"
>}}

Now that we can load up complex scene hierarchies from glTF files and render them correctly, let’s start getting some more interesting colors on screen! glTF defines a [physically based BRDF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation), with support for metallic and roughness properties, along with normal, emission and occlusion texture maps. There are a number of [extensions](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md) on top of this basic material model (the `KHR_materials_*` extensions) that add even more advanced material definitions.

We’ll keep it simple to start. Today we’re going to take the first step of loading the base glTF material parameters and textures from the glB file and passing them to our shader. In the shader we’ll color the object by its base color properties, without applying any lighting or material model yet.

<!--more-->

# Code Changes from the Previous Post

If you’re following along from the [previous lesson’s code](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/4-full-scene-ts), I’ve made a few cleanups while writing this lesson to make it easier to keep growing the lesson’s codebase:

- Split up the different `GLTF*` classes into separate files instead of having it all in `import_glb.ts`
- Split up the JSON importing work in `uploadGLB` to a few separate functions that load each individual part: `loadBufferViews`, `loadAccessors`, `loadMeshes`

I’ve also stopped writing the JavaScript versions of these posts, the rest of the series will be in TypeScript only. The full code for this post can be found on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/5-textures-ts).

# Loading glTF Images, Samplers and Textures

Each texture in the glTF file references an image and, optionally, a sampler. The image defines the data for the texture, while the sampler defines the way that texture coordinates should be looked up within the image and how texels should be interpolated. The texture references the image and sampler by their index in the corresponding image and sampler array, similar to how accessors reference buffer views.

The texture array from Duck.glb is shown below. We have a single texture, which uses sampler 0 and image (source) 0:

```json
"textures": [
  {
    "sampler": 0,
    "source": 0
  }
]
```

The glTF images elements can either reference a file by URI, or a buffer view that contains the texture data. Since we’re only loading glB files in this series, we would expect to always have the texture data embedded in the file and will assume we always have a buffer view like below. The image specifies the buffer view containing its data, and the type of data within that buffer view. In this case, it’s a PNG.

```json
"images": [
  {
    "bufferView": 3,
    "mimeType": "image/png"
  }
]
```

Note that it’s not required that all images in a glB file use buffer views for their data, for example I could have a glB file with lower resolution textures that can be downloaded quickly, that references higher resolution textures by URL that I can fetch asynchronously. We won’t be dealing with these kinds of files in this series though.

Finally, the glTF samplers specify how we should lookup and interpolate texels in the image when rendering. These parameters map directly to the WebGL/OpenGL `glTexParameter` parameter values. The mag/min filter parameters define the texture filtering under magnification and minification, respectively, by directly specifying the OpenGL enum parameter value. Similarly, wrapS and wrapT specify the texture wrapping mode to be used for samples out of the texture bounds.

```json
"samplers": [
  {
    "magFilter": 9729,
    "minFilter": 9986,
    "wrapS": 10497,
    "wrapT": 10497
  }
]
```

We’ll load the data “bottom-up” by first loading the image and sampler data, then loading the texture data. That way we have objects representing the images and samplers that the textures can share.

## Parsing Samplers into GLTFSamplers

The samplers are simple enough to load, we’ll start by defining some enums that store the glTF sampler parameter values so we don’t need to just remember some magic numbers.

```typescript
export enum GLTFTextureFilter {
  NEAREST = 9728,
  LINEAR = 9729,
  NEAREST_MIPMAP_NEAREST = 9984,
  LINEAR_MIPMAP_NEAREST = 9985,
  NEAREST_MIPMAP_LINEAR = 9986,
  LINEAR_MIPMAP_LINEAR = 9987,
}

export enum GLTFTextureWrap {
  REPEAT = 10497,
  CLAMP_TO_EDGE = 33071,
  MIRRORED_REPEAT = 33648,
}
```

Along with some utility functions to get the corresponding WebGPU `GPUFilterMode`, `GPUMipMapFilterMode`, and `GPUAddressMode` from the GLTF enums:

```typescript
export function gltfTextureFilterMode(filter: GLTFTextureFilter) {
  switch (filter) {
    case GLTFTextureFilter.NEAREST_MIPMAP_NEAREST:
    case GLTFTextureFilter.NEAREST_MIPMAP_LINEAR:
    case GLTFTextureFilter.NEAREST:
      return "nearest" as GPUFilterMode;
    case GLTFTextureFilter.LINEAR_MIPMAP_NEAREST:
    case GLTFTextureFilter.LINEAR_MIPMAP_LINEAR:
    case GLTFTextureFilter.LINEAR:
      return "linear" as GPUFilterMode;
  }
}

export function gltfTextureMipMapMode(filter: GLTFTextureFilter) {
  switch (filter) {
    case GLTFTextureFilter.NEAREST_MIPMAP_NEAREST:
    case GLTFTextureFilter.LINEAR_MIPMAP_NEAREST:
    case GLTFTextureFilter.NEAREST:
      return "nearest" as GPUMipmapFilterMode;
    case GLTFTextureFilter.LINEAR_MIPMAP_LINEAR:
    case GLTFTextureFilter.NEAREST_MIPMAP_LINEAR:
    case GLTFTextureFilter.LINEAR:
      return "linear" as GPUMipmapFilterMode;
  }
}

export function gltfAddressMode(mode: GLTFTextureWrap) {
  switch (mode) {
    case GLTFTextureWrap.REPEAT:
      return "repeat" as GPUAddressMode;
    case GLTFTextureWrap.CLAMP_TO_EDGE:
      return "clamp-to-edge" as GPUAddressMode;
    case GLTFTextureWrap.MIRRORED_REPEAT:
      return "mirror-repeat" as GPUAddressMode;
  }
}
```

We can now define a `GLTFSampler` class which will take these GLTF sampler parameters and convert them to their WebGPU equivalents, although for now we’re ignoring mip maps. The class also provides a `create` method that will create the actual `GPUSampler` object with the specified sampler parameters. The `GPUSampler` is what we will pass to our shaders later on to use when sampling the texture.

```typescript
export class GLTFSampler {
  magFilter: GPUFilterMode = "linear";
  minFilter: GPUFilterMode = "linear";

  wrapU: GPUAddressMode = "repeat";
  wrapV: GPUAddressMode = "repeat";

  sampler: GPUSampler = null;

  constructor(
    magFilter: GLTFTextureFilter,
    minFilter: GLTFTextureFilter,
    wrapU: GLTFTextureWrap,
    wrapV: GLTFTextureWrap
  ) {
    this.magFilter = gltfTextureFilterMode(magFilter);
    this.minFilter = gltfTextureFilterMode(minFilter);

    this.wrapU = gltfAddressMode(wrapU);
    this.wrapV = gltfAddressMode(wrapV);
  }

  // Create the GPU sampler
  create(device: GPUDevice) {
    this.sampler = device.createSampler({
      magFilter: this.magFilter,
      minFilter: this.minFilter,
      addressModeU: this.wrapU,
      addressModeV: this.wrapV,
      mipmapFilter: "nearest",
    });
  }
}
```

All that’s left to do is add a function in `import_glb.ts` that takes the JSON chunk and loads up any samplers within it and returns them. We have to handle the case that there are no samplers in the file, the file can omit samplers even if it has textures.

```typescript
function loadSamplers(jsonChunk: any) {
  let samplers = [];
  if (!jsonChunk.samplers) {
    return [];
  }

  for (let s of jsonChunk.samplers) {
    samplers.push(
      new GLTFSampler(
        s["magFilter"] as GLTFTextureFilter,
        s["minFilter"] as GLTFTextureFilter,
        s["wrapS"] as GLTFTextureWrap,
        s["wrapT"] as GLTFTextureWrap
      )
    );
  }
  return samplers;
}
```

## Loading Images into GLTFImages

Next, we need to load the image data out of the glB file by going through the images in the file, getting the data each of their buffer view’s references and turning it into an `ImageBitmap` that we can upload to the GPU.

We’ll actually start by defining an enum that we’ll need later, `ImageUsage`, which records how an image is being used by materials in the scene. Images in a glTF file can be used in a number of material inputs:

- [Base Color](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_pbrmetallicroughness_basecolortexture): the texture contains sRGB color data
- [Metallic + Roughness](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_pbrmetallicroughness_metallicroughnesstexture): the blue channel stores the metalness values, the green channel stores roughness. Texture values are in linear space
- [Normal](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_normaltexture): the texture stores tangent-space normal, with RGB = XYZ. Texture values are in linear space
- [Occlusion](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_occlusiontexture): the R channel of the texture stores occlusion values. Texture values are in linear space
- [Emission](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_emissivetexture): the texture contains sRGB emission values

In order to pick the right texture format, `rgba8unorm-srgb` or `rgba8unorm`, we need to know how a texture is used in the materials referencing it.

```typescript
export enum ImageUsage {
  BASE_COLOR,
  METALLIC_ROUGHNESS,
  NORMAL,
  OCCLUSION,
  EMISSION,
}
```

Now let’s define our `GLTFImage` class. It will take an `ImageBitmap`, track its usage, and let us upload it to the GPU to produce a `GPUTexture` and `GPUTextureView` that we can pass to our shaders. Most of the work happens in `GPUTexture::upload`. Here we actually upload the `ImageBitmap` to a texture on the GPU using [copyExternalImageToTexture](https://gpuweb.github.io/gpuweb/#dom-gpuqueue-copyexternalimagetotexture) . It’s worth noting that this code assumes each image will only have one usage, i.e., that an image used as a base color texture won’t also be used as a normal texture. This is likely a safe assumption, but if this is not the case in some interesting files, we could support creating an sRGB and non-sRGB texture view and the material can get the appropriate view for its usage.

```typescript
// Stores the image data texture for an image in the file
export class GLTFImage {
  bitmap: ImageBitmap;

  // How the texture is used in the materials
  // referencing it
  usage: ImageUsage = ImageUsage.BASE_COLOR;

  image: GPUTexture = null;
  view: GPUTextureView = null;

  constructor(bitmap: ImageBitmap) {
    this.bitmap = bitmap;
  }

  // Set the usage mode for the image
  setUsage(usage: ImageUsage) {
    this.usage = usage;
  }

  // Upload the image to the GPU and create the view
  upload(device: GPUDevice) {
    // Pick the right texture format to use based on the
    // image's usage
    let format: GPUTextureFormat = "rgba8unorm-srgb";
    switch (this.usage) {
      case ImageUsage.BASE_COLOR:
        format = "rgba8unorm-srgb";
        break;
      case ImageUsage.METALLIC_ROUGHNESS:
        format = "rgba8unorm";
        break;
      case ImageUsage.NORMAL:
      case ImageUsage.OCCLUSION:
      case ImageUsage.EMISSION:
        throw new Error("Unhandled image format for now, TODO!");
    }

    const imgSize = [this.bitmap.width, this.bitmap.height, 1];
    this.image = device.createTexture({
      size: imgSize,
      format: format,
      // Note: the render attachment usage is required for
      // copyExternalImageToTexture we aren't going to actually
      // render to these images ourselves
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
      { source: this.bitmap },
      { texture: this.image },
      imgSize
    );

    this.view = this.image.createView();
  }
}
```

With the `GLTFImage` implemented, we can now write a function to load all the images in the glTF file into `GLTFImages` for use later on. To create an image bitmap from the binary data referenced by the `GLTFBufferView` we first create a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) from the view and specify the mimeType. We can then pass the `Blob` to [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap) to create an `ImageBitmap` that we can pass to `copyExternalImageToTexture`.

```typescript
async function loadImages(jsonChunk: any, bufferViews: GLTFBufferView[]) {
  let images: GLTFImage[] = [];
  if (!jsonChunk.images) {
    return images;
  }
  for (let img of jsonChunk.images) {
    const bv = bufferViews[img["bufferView"]];
    const blob = new Blob([bv.view], { type: img["mimeType"] });
    const bitmap = await createImageBitmap(blob);
    images.push(new GLTFImage(bitmap));
  }
  return images;
}
```

## Loading the GLTFTextures

All the hard work is done by the `GLTFSampler` and `GLTFImage`, the `GLTFTexture` just references a sampler and image source to combine them. Since the `GLTFTexture` is what’s going to be stored by the material, it’s convenient to implement `setUsage` on it as well to simply pass the usage flag through to the referenced image.

```typescript
export class GLTFTexture {
  sampler: GLTFSampler;
  image: GLTFImage;

  constructor(sampler: GLTFSampler, image: GLTFImage) {
    this.sampler = sampler;
    this.image = image;
  }

  // Set the texture's image usage flag
  setUsage(usage: ImageUsage) {
    this.image.setUsage(usage);
  }
}
```

Loading the textures from the glTF file is similarly simple, with one caveat. It’s valid to not specify a sampler at all! In this case, the [importer is expected to use an appropriate default filtering mode and repeat addressing](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_texture_sampler). We handle this by creating a default sampler to use if no sampler was referenced and adding it to the samplers list if it was used so that we can create it on the device later on.

```typescript
function loadTextures(
  jsonChunk: any,
  images: GLTFImage[],
  samplers: GLTFSampler[]
) {
  let textures: GLTFTexture[] = [];
  if (!jsonChunk.textures) {
    return textures;
  }
  const defaultSampler = new GLTFSampler(
    GLTFTextureFilter.LINEAR,
    GLTFTextureFilter.LINEAR,
    GLTFTextureWrap.REPEAT,
    GLTFTextureWrap.REPEAT
  );
  let usedDefaultSampler = false;

  for (let t of jsonChunk.textures) {
    let sampler = null;
    if ("sampler" in t) {
      sampler = samplers[t["sampler"]];
    } else {
      // If no sampler was specified, use the default
      sampler = defaultSampler;
      usedDefaultSampler = true;
    }
    textures.push(new GLTFTexture(sampler, images[t["source"]]));
  }
  // If we used the default sampler add it to the samplers list so its
  // GPU resources will be created
  if (usedDefaultSampler) {
    samplers.push(defaultSampler);
  }
  return textures;
}
```

# Loading GLTFMaterials

[Materials in glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-material) specify the PBR model parameters and textures, as shown below for the Duck. Here we have a base color texture reference, along with metallic and emissive factors.

```json
"materials": [
  {
    "pbrMetallicRoughness":
    {
      "baseColorTexture": {"index": 0},
      "metallicFactor": 0.0
    },
    "emissiveFactor": [0.0, 0.0, 0.0]
  }
]
```

We’ll represent these with the `GLTFMaterial` class, shown below. When provided textures, the material class will mark them with their corresponding usage in the material. The `GLTFMaterial::upload` method will upload the `baseColorFactor`, `metallicFactor` and `roughnessFactor` parameters to a uniform buffer and create a bind group referencing the material parameters (uniform buffer and any relevant textures). This is omitted for brevity, but can be found on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/5-textures-ts/src/gltf_material.ts).

```typescript
export class GLTFMaterial {
  baseColorFactor: vec4 = [1, 1, 1, 1];
  baseColorTexture: GLTFTexture | null = null;

  metallicFactor: number = 1;
  roughnessFactor: number = 1;
  metallicRoughnessTexture: GLTFTexture | null = null;

  // Uniform buffer holding the material factor params
  paramBuffer: GPUBuffer = null;

  // Bind group layout and bind groups for the material parameters
  bindGroupLayout: GPUBindGroupLayout = null;
  bindGroup: GPUBindGroup = null;

  constructor(
    baseColorFactor: vec4,
    baseColorTexture: GLTFTexture | null,
    metallicFactor: number,
    roughnessFactor: number,
    metallicRoughnessTexture: GLTFTexture | null
  ) {
    this.baseColorFactor = baseColorFactor;
    this.baseColorTexture = baseColorTexture;
    if (this.baseColorTexture) {
      this.baseColorTexture.setUsage(ImageUsage.BASE_COLOR);
    }

    this.metallicFactor = metallicFactor;
    this.roughnessFactor = roughnessFactor;
    this.metallicRoughnessTexture = metallicRoughnessTexture;
    if (this.metallicRoughnessTexture) {
      this.metallicRoughnessTexture.setUsage(ImageUsage.METALLIC_ROUGHNESS);
    }
  }

  // Upload params buffer and create the bind group and bind group layout
  // for the material params
  upload(device: GPUDevice) {
    // See github...
  }
}
```

We’ll load the materials from the file by adding a new `loadMaterials` function, that goes through any materials in the file and constructs the corresponding `GLTFMaterial`. If any values are missing from the material we apply the default value from the spec.

```typescript
function loadMaterials(jsonChunk: any, textures: GLTFTexture[]) {
  let materials = [];
  for (let m of jsonChunk.materials) {
    const pbrMR = m["pbrMetallicRoughness"];
    // Default base color factor of 1, 1, 1
    const baseColorFactor = pbrMR["baseColorFactor"] ?? [1, 1, 1, 1];
    const metallicFactor = pbrMR["metallicFactor"] ?? 1;
    const roughnessFactor = pbrMR["roughnessFactor"] ?? 1;

    let baseColorTexture: GLTFTexture | null = null;
    if ("baseColorTexture" in pbrMR) {
      baseColorTexture = textures[pbrMR["baseColorTexture"]["index"]];
    }
    let metallicRoughnessTexture: GLTFTexture | null = null;
    if ("metallicRoughnessTexture" in pbrMR) {
      metallicRoughnessTexture =
        textures[pbrMR["metallicRoughnessTexture"]["index"]];
    }
    materials.push(
      new GLTFMaterial(
        baseColorFactor,
        baseColorTexture,
        metallicFactor,
        roughnessFactor,
        metallicRoughnessTexture
      )
    );
  }
  return materials;
}
```

# Loading and Using Materials for Primitives

When we were loading primitives before, we skipped the “material” field that each primitive has. Now it’s time to come back and load it. Since we’re applying textures, we also will start loading the `TEXCOORDS_0` attribute that can also be specified on a primitive. The mesh loading code has been split out to [loadMeshes](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/5-textures-ts/src/import_glb.ts#L238-L289) as part of the code organization cleanup from the previous step. This function will now also take the `GLTFMaterial[]` array so that we can pass the corresponding material to each primitive when it’s created. We’ll also modify the `GLTFPrimitive` constructor to take a `GLTFMaterial` as a parameter and store it as a member variable.

```typescript
function loadMeshes(
  jsonChunk: any,
  accessors: GLTFAccessor[],
  materials: GLTFMaterial[]
) {
  let meshes = [];
  for (let mesh of jsonChunk.meshes) {
    let meshPrimitives = [];
    for (let prim of mesh.primitives) {
      // Get topology and indices as before...

      // Get the positions and the texture coordinates
      let positions = null;
      let texcoords = null;
      for (let attr in prim["attributes"]) {
        let accessor = accessors[prim["attributes"][attr]];
        if (attr === "POSITION") {
          positions = accessor;
        } else if (attr === "TEXCOORD_0") {
          texcoords = accessor;
        }
      }

      // Lookup the material for the primitive
      let mat = materials[prim["material"]];

      // Add the primitive to the mesh's list of primitives
      meshPrimitives.push(
        new GLTFPrimitive(mat, positions, indices, texcoords, topology)
      );
    }
    meshes.push(new GLTFMesh(mesh["name"], meshPrimitives));
  }
  return meshes;
}
```

## Updating GLTFPrimitive buildRenderPipeline

Our [GLTFPrimitive](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/5-textures-ts/src/gltf_primitive.ts) gets two additions in `buildRenderPipeline` :

- Adding the texture coordinates attribute, if it has texture coordinates
- Adding the material bind group layout to its render pipeline’s bind group layouts

Our `vertexState` will now be built as shown below. We add the position attribute buffer as before, and now, if we have texture coordinates, we add the texture coordinates vertex buffer as well.

```typescript
let vertexBuffers: GPUVertexBufferLayout[] = [
  {
    arrayStride: this.positions.byteStride,
    attributes: [
      {
        format: this.positions.elementType as GPUVertexFormat,
        offset: 0,
        shaderLocation: 0,
      },
    ],
  },
];
if (this.texcoords) {
  vertexBuffers.push({
    arrayStride: this.texcoords.byteStride,
    attributes: [
      {
        format: this.texcoords.elementType as GPUVertexFormat,
        offset: 0,
        shaderLocation: 1,
      },
    ],
  });
}

// Vertex attribute state and shader stage
let vertexState = {
  // Shader stage info
  module: shaderModule,
  entryPoint: "vertex_main",
  // Vertex buffer info
  buffers: vertexBuffers,
};
```

We’ll also now add the primitive’s material bind group layout to its pipeline:

```typescript
// Add the material bind group layout
bindGroupLayouts.push(this.material.bindGroupLayout);

let layout = device.createPipelineLayout({
  bindGroupLayouts: bindGroupLayouts,
});
```

# Updating uploadGLB

We can now add calls to our loader functions in `uploadGLB` . We start by loading all the buffer views, and accessors, after which we get the images, samplers, textures and materials. Finally we can load the meshes. Once all the data has been loaded from the file we know what usage our GPU objects have and can upload them.

```typescript
// Load the buffer views
const bufferViews = loadBufferViews(jsonChunk, binaryChunk);
// Load the GLTF accessors
const accessors = loadAccessors(jsonChunk, bufferViews);
// Load and decode all the images in the file
const images = await loadImages(jsonChunk, bufferViews);
// Load all the samplers in the file
const samplers = loadSamplers(jsonChunk);
// Load all the textures, which just combine a sampler + image
const textures = loadTextures(jsonChunk, images, samplers);
// Load all the materials
const materials = loadMaterials(jsonChunk, textures);
// Load all meshes
const meshes = loadMeshes(jsonChunk, accessors, materials);

// Upload data to the GPU

// Upload the buffer views used by mesh
bufferViews.forEach((bv: GLTFBufferView) => {
  if (bv.needsUpload) {
    bv.upload(device);
  }
});
// Upload all images, now that we know their usage and can
// pick the right GPU texture format
images.forEach((img: GLTFImage) => {
  img.upload(device);
});
// Create all samplers
samplers.forEach((s: GLTFSampler) => {
  s.create(device);
});
// Create bind groups and UBOs for materials
materials.forEach((mat: GLTFMaterial) => {
  mat.upload(device);
});
```

# Updating the Shader to use the Material

Since we’re not using a fancy material or lighting model yet to implement the GLTFMaterial, our changes to the [shader code](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/5-textures-ts/src/gltf_prim.wgsl) are pretty simple. First, we’ll add new vertex inputs and outputs to pass the texture coordinates through from the vertex shader to the fragment shader, along with a new `float2` alias.

```glsl
alias float2 = vec2<f32>;

struct VertexInput {
    @location(0) position: float3,
    @location(1) texcoords: float2,
};

struct VertexOutput {
    @builtin(position) position: float4,
    @location(0) world_pos: float3,
    @location(1) texcoords: float2,
};
```

Our material parameters will be passed as uniforms, samplers, and textures in the material bind group. Let’s add these definitions to our shader:

```glsl
struct MaterialParams {
    base_color_factor: float4,
    metallic_factor: f32,
    roughness_factor: f32,
};

@group(2) @binding(0)
var<uniform> material_params: MaterialParams;

@group(2) @binding(1)
var base_color_sampler: sampler;

@group(2) @binding(2)
var base_color_texture: texture_2d<f32>;
```

Finally, in the fragment shader we can use the material parameters to color the fragment. Since we’re now dealing with sRGB textures and want our rendering to be gamma correct, I’ve also added a [linear_to_srgb](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/5-textures-ts/src/gltf_prim.wgsl#L45-L50) utility function in the shader to convert our linear color values back to sRGB for display.

```glsl
@fragment
fn fragment_main(in: VertexOutput) -> @location(0) float4 {
    let base_color = textureSample(base_color_texture, base_color_sampler, in.texcoords);
    var color = material_params.base_color_factor * base_color;

    color.x = linear_to_srgb(color.x);
    color.y = linear_to_srgb(color.y);
    color.z = linear_to_srgb(color.z);
    color.w = 1.0;
    return color;
}
```

# Results

That’s it! With everything in, you should see a nicely rendered Duck like shown below. The full code, and the Duck model (from the glTF sample models repo) can be found on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/5-textures-ts). You can run the demo embedded below, or directly [here](https://www.willusher.io/webgpu-0-to-gltf/5-textures-ts). If you try out a few models you might find the code crashes or doesn’t render materials correctly in some cases. This is because we have some built in assumptions in the code now, that all primitives will have materials, textures are always using texcoord 0, etc. We’ll come back to this later when we look at dynamically creating shaders specific to each primitive configuration.

If you have questions or want to discuss this post, you can use the [Github discussion forum](https://github.com/Twinklebear/webgpu-0-to-gltf/discussions/5).

<div class="ratio ratio-4x3">
<iframe src="https://www.willusher.io/webgpu-0-to-gltf/5-textures-ts">
</iframe>
</div>
