---
layout: single
title: "From 0 to glTF with WebGPU: Rendering the Full glTF Scene"
tags: [graphics, webgpu, gltf]
date: 2023-06-24
url: /graphics/2023/06/24/0-to-gltf-full-scene

---

{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/broken-to-fixed-engine.webp"
caption=`In this post, we'll look at how to fix our terribly broken 2 Cylinder Engine.
  Left: A buggy render of 2CylinderEngine.glb achieved when ignoring the glTF node transformations.
  Right: The correct rendering with meshes positioned based on the hierarchy of transforms
  specified in the glTF node tree.`
  >}}

Loading and drawing our first mesh from a glTF file was quite a bit of work in the [previous post]({{< ref 2023-05-16-0-to-gltf-first-mesh >}}), but with this core piece in place we can start adding a lot more functionality to our renderer pretty quickly. If you tried loading up glTF files into the renderer from the previous post, you may have noticed that they didn’t look how you expected. This is because glTF files often contain many meshes that make up different parts of the scene geometry, most of which will be missing since we only loaded the first mesh last time. If we just add a simple loop through the meshes to load and draw them all we’ll frequently end up with a scene like the broken engine on the left in the image above. This is because the meshes are reference and transformed by the glTF node hierarchy, and we need to load and handle these nested transformations to render the correct scene shown on the right. The test model we’ll be using for this post is the [2CylinderEngine](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/2CylinderEngine) from the Khronos glTF samples repo, which has nested transformations in its node hierarchy that make it a great test case. So grab [2CylinderEngine.glb](https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb) and let’s get started!

<!--more-->

# glTF Scenes and Nodes

The next step up the glTF concepts hierarchy are nodes and scenes (see [glTF 2.0 cheat sheet](https://www.khronos.org/files/gltf20-reference-guide.pdf)). A glTF file can contain multiple scenes, each of which references a tree of nodes specifying the  hierarchy of objects in the scene. Each node may specify a transform, a list of child nodes, and a mesh or camera. A node’s transform is specified relative to its parent node, defining a hierarchy of transformations in the tree, allowing sharing transform data across groups of objects. Each glTF file can contain multiple scenes and can specify a default scene that should be rendered. A file with two scenes and their node trees is illustrated below, with the matching JSON following it.

{{< numbered_fig
    src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-2-scenes-hierarchy.webp"
caption=`A sketch of a simple glTF file with two scenes. Scene 0 containes 4 nodes in total,
  nodes 3 and 4 are children or node 0 and thus should be positioned relative to node 0's transform.`
  >}}


```json
{
  "scene": 0,
  "scenes": [
    {
      "nodes": [0, 1]
    },
    {
      "nodes": [2]
    }
  ],
  "nodes": [
    {
      "children": [3, 4],
      "matrix": [...]
    },
    {
      "translation": [...],
      "rotation": [...],
      "scale": [...],
      "mesh": 0
    },
    {
      "mesh": 1
    },
    {
      "mesh": 2
    },
    {
      "matrix": [...],
      "mesh": 3
    }
  ] 
}
```

# Flattening glTF Node Transforms

The nodes in the scene define a tree which has a hierarchy of transformations that must be applied down the tree to correctly position the scene geometry. While Figure 1 left showed the result if we simply loaded all meshes and ignore the node data, another error would be to just load the nodes individually and ignore the hierarchy of transformations. This would give us a buggy scene like shown below for the 2CylinderEngine.

{{< numbered_fig
    src="https://cdn.willusher.io/webgpu-0-to-gltf/transforms-not-apply-parent.webp"
  caption=`Another buggy rendering of the 2CylinderEngine. This bug is achieved by applying
  the individual node transforms without taking into account the full transform hierarchy
  defined by the node tree. I.e., by only applying each individual node's transform to its mesh
  and not including the node's parent's transform.`
  >}}


To correctly position each mesh node, we must apply the transformations in order from the root of the tree down to the node referencing a given mesh. However, glTF node trees can be deep, with multiple nested transformations. Storing and traversing the tree each time we render a mesh would require a large amount of storage and complex logic in the shader. A common approach is to instead flatten out the tree, computing the final node to world transform matrix for each mesh node that we can then pass to our vertex shader. This process is illustrated below to compute the transform matrix for node 3’s mesh in our example scene 0. Child node transforms are multiplied on from the right to apply the transformation hierarchy in order from the bottom to top, as each child node’s transform is relative to its parent.

{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-depth-first-traversal.webp"
caption=`Depth first traversal of Scene 0's node tree to compute final transformation
  matrices for each node.`
  >}}


This process of traversing the tree and flattening out the transformations amounts to a depth-first traversal of the node tree. We can implement this process as a recursive depth-first tree traversal where we return a simple list of the flattened nodes. Our function will take as input a node tree and produce a flattened list of nodes each with its final node to world transform, as illustrated below. The final matrix for each node is labeled in the output, showing the set of matrices that were combined to compute it during the traversal.

{{< numbered_fig
src="https://cdn.willusher.io/webgpu-0-to-gltf/gltf-flatten-tree-output.webp"
caption="An illustration of `flattenTree`'s depth first traversal and output. Node 0's transform is applied to its children to produce a flattened list of nodes where each node stores its final node to world transform that can be passed directly to the shader."
  >}}

We implement this as the recursive `flattenTree` ([code](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/4-full-scene/src/glb.js#L412-L432)) function shown below. This function performs a depth-first traversal of the tree to output a flat list of nodes with the correct world-space transforms. Given the list of all nodes in the file, the current node being processed and its parent’s transform we perform the following:

- First, we combine this node’s transform with its parent to compute its flattened transform
- Next, we create a new glTF node from the input node that now uses this flattened transform and that specifies no children. This node is appended to the output flat node list.
- Finally, we recursively call `flattenTree` on this nodes children, passing the current node’s flattened transform as the new parent transform. The returned nodes from the children are appended to the flattened node list, which we return at the end.

```javascript
// Flatten the glTF node tree to flatten the hierarchical transforms
// The root node is included in the flattened tree
function flattenTree(allNodes, node, parent_transform) {
    var flattened = [];
    var tfm = readNodeTransform(node);
    var tfm = mat4.mul(tfm, parent_transform, tfm);

    // Add the flattened current node
    var n = {
        matrix: tfm,
        mesh: node["mesh"],
        camera: node["camera"],
    };
    flattened.push(n);

    // Loop through the node's children and recursively flatten them as well
    if (node["children"]) {
        for (var i = 0; i < node["children"].length; ++i) {
            flattened.push(...flattenTree(allNodes,
                                          allNodes[node["children"][i]],
                                          tfm));
        }
    }
    return flattened;
}
```

To read a node’s transform we write another function, `readNodeTransform`. A glTF node’s transform can either be specified through a column major matrix or a rotation quaternion, translation, and scale. We’re using using the [glMatrix library](https://glmatrix.net/) for matrix math operations here.

```javascript
function readNodeTransform(node) {
    if (node["matrix"]) {
        var m = node["matrix"];
        // Both glTF and gl matrix are column major
        return mat4.fromValues(m[0],
            m[1],
            m[2],
            m[3],
            m[4],
            m[5],
            m[6],
            m[7],
            m[8],
            m[9],
            m[10],
            m[11],
            m[12],
            m[13],
            m[14],
            m[15]);
    } else {
        var scale = [1, 1, 1];
        var rotation = [0, 0, 0, 1];
        var translation = [0, 0, 0];
        if (node["scale"]) {
            scale = node["scale"];
        }
        if (node["rotation"]) {
            rotation = node["rotation"];
        }
        if (node["translation"]) {
            translation = node["translation"];
        }
        var m = mat4.create();
        return mat4.fromRotationTranslationScale(m, rotation, translation, scale);
    }
}
```

# Loading the Default Scene

We’ll introduce two new classes, `GLTFScene` and `GLTFNode` to represent glTF scene and node objects respectively. The `GLTFScene` simply takes a flattened list of nodes that make up the scene. The nodes are expected to have been flattened by calling `flattenTree`

```javascript
export class GLTFScene {
  constructor(nodes) {
      this.nodes = nodes;
  }

  buildRenderPipeline(device, shaderModule, colorFormat, depthFormat, uniformsBGLayout) {
    // Covered in the next section
  }

  render(renderPassEncoder, uniformsBG) {
    // Covered in the next section
  }
}
```

The `GLTFNode` takes the node name, transform, and mesh.

```javascript
export class GLTFNode {
  constructor(name, transform, mesh) {
    this.name = name;
    this.transform = transform;
    this.mesh = mesh;
  }

  buildRenderPipeline(device, shaderModule, colorFormat, depthFormat, uniformsBGLayout) {
    // Covered in the next section
  }

  render(renderPassEncoder) {
    // Covered in the next section
  }
}
```

Now at the end of `uploadGLB` from the previous post, we can get the default scene’s list of nodes and loop through them to flatten out each subtree and build the list of `GLTFNode` objects defining the scene. This code is placed after the buffer view upload step ([code](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/4-full-scene/src/glb.js#L577-L601)). Our code now returns a `GLTFScene`, however the scene provides the same interface as the `GLBMesh` so we don’t need to update our application code.

```javascript
// After the buffer view upload step in uploadGLB

// Build the default GLTFScene, we just take all the mesh nodes for now
var defaultSceneNodes = jsonChunk["scenes"][0]["nodes"];
// If we have a default scene, load it, otherwise we use the first scene
if (jsonChunk["scenes"]) {
  defaultSceneNodes = jsonChunk["scenes"][jsonChunk["scene"]]["nodes"];
}
var defaultNodes = [];
for (var i = 0; i < defaultSceneNodes.length; ++i) {
  // Get each node referenced by the scene and flatten it and its children
  // out to a single-level scene so that we don't need to keep track of nested
  // transforms in the renderer
  // We'll need to put a bit more thought here when we start handling animated nodes
  // in the hierarchy. For now this is fine.
  var n = jsonChunk["nodes"][defaultSceneNodes[i]];
  var nodeTransform = readNodeTransform(n);
  var flattenedNodes = flattenTree(jsonChunk["nodes"], n, nodeTransform);

  // Add all the mesh nodes in the flattened node list to the scene's default nodes
  for (var j = 0; j < flattenedNodes.length; ++j) {
    var fn = flattenedNodes[j];
    if (fn["mesh"]) {
      defaultNodes.push(new GLTFNode(n["name"], fn["matrix"], meshes[fn["mesh"]]));
    }
  }
}

document.getElementById("loading-text").hidden = true;

return new GLTFScene(defaultNodes);
```

# Drawing glTF Scenes and Nodes

Now that we’ve loaded up our full scene, lets fill out the `buildRenderPipeline` and `render` methods, and update our shaders to get it rendered!

## Drawing a GLTFScene

The `GLTFScene` ([code](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/4-full-scene/src/glb.js#L391)) is the entry point to dispatch `buildRenderPipeline` and `render` to the `GLTFNodes`. In `buildRenderPipeline` the scene just calls down to each of its nodes, but in `render` we can lift binding the view params bind group up, so that each mesh primitive no longer makes this redundant call.

```javascript
export class GLTFScene {
  constructor(nodes) {...}

  buildRenderPipeline(device,
                      shaderModule,
                      colorFormat,
                      depthFormat,
                      uniformsBGLayout)
  {
    for (var i = 0; i < this.nodes.length; ++i) {
      this.nodes[i].buildRenderPipeline(device,
                                        shaderModule,
                                        colorFormat,
                                        depthFormat,
                                        uniformsBGLayout);
    }
  }

  render(renderPassEncoder, uniformsBG) {
    // Setting bind group 0 containing the view params is shared by all
    // Nodes, Meshes, Primitives, so we can simply lift the call up here
    // and remove it from GLTFPrimitive.render
    renderPassEncoder.setBindGroup(0, uniformsBG);
    for (var i = 0; i < this.nodes.length; ++i) {
      this.nodes[i].render(renderPassEncoder);
    }
  }
}
```

## Drawing a GLTFNode

The `GLTFNode` ([code](https://github.com/Twinklebear/webgpu-0-to-gltf/blob/main/4-full-scene/src/glb.js#L352)) is responsible for passing the transform to be applied to the mesh being rendered. As mentioned previously, this will be passed through a new uniform buffer. We’ll introduce a new bind group to hold the node parameters, which for now is just the transformation matrix. In `buildRenderPipeline` the `GLTFNode` creates and uploads the node transform and creates a new bind group referencing it. The bind group layout is passed on to the `GLTFMesh` and `GLTFPrimitive`, which we modify to take this new parameter and pass it to the pipeline layout creation call.

```javascript
export class GLTFNode {
  constructor(name, transform, mesh) {
    this.name = name;
    this.transform = transform;
    this.mesh = mesh;
  }

  buildRenderPipeline(device, shaderModule, colorFormat, depthFormat, uniformsBGLayout) {
    // Upload the node transform
    this.nodeParamsBuf = device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Float32Array(this.nodeParamsBuf.getMappedRange()).set(this.transform)
    this.nodeParamsBuf.unmap();

    var bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {type: "uniform"}}]
    });
    this.nodeParamsBG = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{binding: 0, resource: {buffer: this.nodeParamsBuf}}]
    });

    this.mesh.buildRenderPipeline(device,
                                  shaderModule,
                                  colorFormat,
                                  depthFormat,
                                  uniformsBGLayout,
                                  bindGroupLayout);
  }

  render(renderPassEncoder) {
    // Bind the node parameters bind group containing the node transform
    renderPassEncoder.setBindGroup(1, this.nodeParamsBG);
    this.mesh.render(renderPassEncoder);
  }
}
```

## Updating GLTFMesh and GLTFPrimitive

Next, we need to update the `GLTFMesh.buildRenderPipeline` call to take the new node parameters bind group layout parameter and pass this through to its `GLTFPrimitives`

This change is straightforward for the `GLTFMesh`

```javascript
export class GLTFMesh {
  constructor(name, primitives) {...}

  buildRenderPipeline(device,
                      shaderModule,
                      colorFormat,
                      depthFormat,
                      uniformsBGLayout,
                      nodeParamsBGLayout)
  {
    // Only change: take the nodeParamsBGLayout and pass it down to our
    // primitives to use in building their pipeline layout
    for (var i = 0; i < this.primitives.length; ++i) {
      this.primitives[i].buildRenderPipeline(device,
                                             shaderModule,
                                             colorFormat,
                                             depthFormat,
                                             uniformsBGLayout,
                                             nodeParamsBGLayout);
      }
  }

  // No longer need to take and pass the view params bind group
  render(renderPassEncoder) {...}
}
```

Finally, at the `GLTFPrimitive` we take the nodeParamsBGLayout and include it in our pipeline layout

```javascript
export class GLTFPrimitive {
  constructor(positions, indices, topology) {...}

  buildRenderPipeline(device,
                      shaderModule,
                      colorFormat,
                      depthFormat,
                      uniformsBGLayout,
                      nodeParamsBGLayout)
  {
    // Vertex attribute state and shader stage
    var vertexState = {
      // Same as before
    };

    var fragmentState = {
      // Same as before
    };

    // Same as before, topology setup
    var primitive = {topology: "triangle-list"};
    if (this.topology == GLTFRenderMode.TRIANGLE_STRIP) {
      primitive.topology = "triangle-strip";
      primitive.stripIndexFormat = this.indices.vertexType;
    }

    var layout = device.createPipelineLayout({
      // New: Pass the nodeParamsBGLayout as another bind group layout
      // in our pipeline
      bindGroupLayouts: [uniformsBGLayout, nodeParamsBGLayout]
    });

    // renderPipeline creation is the same as before
  }

  render(renderPassEncoder) {
    // Removed: no longer need to bind the view params bind group
    renderPassEncoder.setPipeline(this.renderPipeline);

    // Rest of rendering code is the same as before
  }
}
```

## Updating our Shader Code

Our node transform matrix is now on the GPU and being passed through a bind group as a uniform parameter that we can access in our shader. The last step is to update our shader code from before to apply the node transform to the vertices in the vertex shader. The shader code is the same as before, with the addition of the `node_params` bind group and its use in `vertex_main`

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

// New struct for our node params
struct NodeParams {
    transform: mat4x4<f32>,
};

@group(0) @binding(0)
var<uniform> view_params: ViewParams;

// New uniform parameter passing our node params
@group(1) @binding(0)
var<uniform> node_params: NodeParams;

@vertex
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    // New: use node_params.transform to transform the vertices into world space
    out.position = view_params.view_proj * node_params.transform * float4(vert.position, 1.0);
    out.world_pos = vert.position.xyz;
    return out;
};

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) float4 {
    let dx = dpdx(in.world_pos);
    let dy = dpdy(in.world_pos);
    let n = normalize(cross(dx, dy));
    return float4((n + 1.0) * 0.5, 1.0);
}
```

# Result

That’s it! Now we can correctly render the 2CylinderEngine glTF scene, properly accounting for the hierarchical node transforms specified in the file to position the geometry in the scene. You can view the full code on [Github](https://github.com/Twinklebear/webgpu-0-to-gltf/tree/main/4-full-scene) to run the app locally, [view it online](https://www.willusher.io/webgpu-0-to-gltf-demos/4-full-scene/), or simply run try it out in the embed below.

Feel free to ask any questions or post comments on the [Github discussion board for this post](https://github.com/Twinklebear/webgpu-0-to-gltf/discussions/3).

Now that we’re rendering entire glTF scenes we find that we’re creating a lot of redundant render pipelines and repeatedly binding them. We'll come back to optimizing this later on.
In the meantime, I highly recommend checking out [Brandon Jones's write up on efficient rendering of glTF in WebGPU](https://toji.github.io/webgpu-gltf-case-study/)!
See you next time!


<div class="ratio ratio-4x3">
<iframe src="https://www.willusher.io/webgpu-0-to-gltf-demos/4-full-scene/index.html"></iframe>
</div>

