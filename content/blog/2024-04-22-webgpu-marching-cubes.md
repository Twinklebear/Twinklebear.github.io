---
layout: single
title: "GPU Compute in the Browser at the Speed of Native: WebGPU Marching Cubes"
category: graphics
tags: [graphics, webgpu]
date: 2024-04-22
url: /graphics/2024/04/22/webgpu-marching-cubes

---

WebGPU is a powerful GPU-API for the web, providing support for advanced low-overhead rendering pipelines and GPU compute pipelines. WebGPU’s support for GPU compute shaders and storage buffers are a key distinction from WebGL, which lacks these features, and make it possible to bring powerful GPU-parallel applications to run entirely in the browser. These applications can range from GPGPU (e.g., simulations, data processing/analysis, machine learning, etc.) to GPU compute driven rendering pipelines, and applications across the spectrum.

In this post, we’ll evaluate WebGPU compute performance against native Vulkan by implementing the classic Marching Cubes algorithm in WebGPU. Marching Cubes is a nearly embarrassingly parallel algorithm, with two global reduction steps that must take place to synchronize work items and thread output locations. This makes it a great first GPU-parallel algorithm to try out on a new platform, as it has enough complexity to stress the API in a few different ways beyond simple parallel kernel dispatches but isn’t so complex as to take an substantial amount of time to implement or be bottlenecked by CPU performance.

<!--more-->


# Introduction to Marching Cubes

[Marching Cubes](https://en.wikipedia.org/wiki/Marching_cubes) is a classic algorithm in computer graphics for 3D surface reconstruction that was first introduced in 1987 by Lorensen and Cline. Given a scalar field defined over a 3D grid, Marching Cubes can be used to compute a triangle mesh of the surface at a given scalar value. The initial motivation for Marching Cubes was medical visualization, where given a 3D volume from a CT or MRI scan, the algorithm was used to compute surfaces representing bone or tissue for display. Marching Cubes and its follow-on algorithms are widely used in scientific visualization to compute surfaces on simulation data sets and medical imaging volumes; and can also be applied to rendering mathematical implicit surfaces defined over a 3D grid domain.

The algorithm is a bit easier to first understand in 2D, where it turns into the [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm.
Given a grid with values defined in each cell, we want to compute contour lines on the grid placed at a given value.
For example, on a map we may want to draw elevation lines at a certain elevation.
The Marching Squares algorithm proceeds as shown in the figure below.
Marching Cubes can be seen as generalization of Marching Squares into 3D, although the Marching Cubes algorithm was actually published first
and Marching Squares was a simplification of it into 2D.

{{< numbered_fig
src="https://cdn.willusher.io/img/2024-04-22-wgpu-mc-marching-squares.png"
caption=`Given the cell-centered grid (a), we shift to the Dual Grid (b, in blue), where values are defined at the vertices instead of the cell centers.
Within a cell (c) we can now classify it into a contour case based on the values at its vertices (d). We compute a bitmask of 4 bits (one per vertex),
where the bit is set if the vertex value is below the contour value, and 0 if it's above or equal to it. This bitmask is then
used as an index value into a case table that defines the edges that the contour crosses of the cell (e).`
>}}

Although we’ll focus on a standard GPU-parallel implementation of Marching Cubes here, we need some understanding of how the algorithm processes the data and interdependencies in the algorithm (if any) to see how it can be parallelized. For a more thorough discussion of Marching Cubes in a scalar execution context, see [Paul Bourke’s excellent write-up](http://paulbourke.net/geometry/polygonise/). Another cool write up that explains the basics of Marching Cubes starting from 2D [is this write up by 42yeah](https://blog.42yeah.is/algorithm/2023/07/15/marching-cubes.html).

To construct the triangle mesh representing the entire surface, Marching Cubes breaks the problem down to the task of computing the individual pieces of the surface that pass through each voxel. There are a number of possibilities for how the surface may pass through a voxel: it could be that the surface cuts the cell in half, clips a corner of it, passes through at some angle, or does not pass through at all. Each voxel has 8 vertices, each of which can be either inside or outside the surface, giving us a total of 2^8 = 256 possible configurations for a voxel. For each voxel we compute an 8-bit mask, where a 1 is marked for vertices below the desired surface value. The voxel bit mask is used to index into a triangulation case table that stores the list of edges that are intersected by each triangle in the voxel’s local surface. Each voxel’s surface can contain up to 5 triangles, following from the triangulation cases defined in the original Marching Cubes paper.

{{< numbered_fig
src="https://cdn.willusher.io/img/2024-04-22-wgpu-mc-tritable-case.png"
caption=`Case 1 in the Marching Cubes triangle table: The isosurface crosses edges 
    0, 3, and 8, defining a single triangle within the cell. The case index
    is a bitmask where each bit marks 1 if the vertex's value is below the
    isovalue and 0 otherwise. This produces an index into the case table,
    which stores a triangulation for each case as the list of edges where
    the triangle's vertices should be placed.`
    >}}


A serial version of the algorithm can be implemented with the following pseudo-code

```python
output_vertices = []
for v in voxels:
  vertex_values = load_voxel_vertices(v)
  case_index = compute_case_index(vertex_values, isovalue)

  # No triangles in this voxel, skip it
  if case_index == 0 || case_index == 255:
    continue

  triangulation = case_table[case_index]
  for tri in triangulation:
    vertices = compute_triangle_vertices(tri, vertex_values, isovalue)
    output_vertices += vertices
```

## Working on the Dual Grid

Marching Cubes requires each voxel’s values to be defined at its vertices, i.e. that the grid is “vertex-centered”. However, when we think about images or volumes (essentially 3D images), we typically think of them as cell-centered, where the values are defined at the center of each pixel or voxel. In order to run Marching Cubes on a cell-centered grid, we shift on to its “Dual Grid”. The Dual Grid places vertices at the cell centers of the cell-centered grid, producing a vertex-centered grid that is 1 cell smaller along each axis, and shifted up by half a cell:

{{< numbered_fig
src="https://cdn.willusher.io/img/2024-04-22-wgpu-mc-vertex-grid-to-dual.png"
caption=`Cell-centered grids are widely used in simulation and data scanning systems;
    however, Marching Cubes requires values defined at the vertices.
    For regular grids we can simply shift computation on to the Dual Grid,
    which is defined by placing a vertex at each cell's center in the cell-centered
    grid. The resulting Dual Grid has 1 fewer cells on each axis and is shifted
    up spatially by 0.5 on each axis.`
  >}}

# GPU-Parallel Marching Cubes

From the pseudo-code above, we can see that Marching Cubes is well-suited to parallel execution, as each voxel can be processed independently. However, there is one array that is written by all voxels and which will be a write conflict without some care: the `output_vertices` array. Each voxel can output a varying number of vertices depending on its vertex values. We know that each voxel can output at most 5 triangles, so we could conservatively allocate space for 5 triangles per voxel and fill unused entries with degenerate triangles; however, this would require a prohibitive amount of memory for large surfaces and impact rendering performance. Instead, we would like to output a compact buffer containing just the valid output triangles.

To write a compact vertex buffer while preventing voxels from trampling each other’s output, we will split up the triangulation process into two kernels, and leverage the classic parallel primitive [“Prefix Sum”](https://en.wikipedia.org/wiki/Prefix_sum) (also known as Exclusive Scan). First, we compute the number of vertices that each voxel will output, then we use an exclusive scan to turn this list into a sequence of output offsets for each voxel. Finally, we run a second kernel that writes each voxel’s triangles to its assigned subregion of the array using the offset computed by the exclusive scan.

We’ll also apply another optimization that requires a global synchronization step to filter down the list of voxels that we run the vertex count and computation kernels over. This optimization is similar to the early out in the pseudo-code. In a GPU-parallel context we will do this by computing a list of active voxel IDs. Our subsequent vertex computation kernels then only operate on the active voxels. The main benefit of this step is to increase GPU utilization and coherence for our vertex computation kernels. Rather than dispatching thousands of threads that immediately early-exit due to their voxel not containing triangles, we can efficiently filter them out ahead of time so that our vertex computation kernels only operate on a much smaller list of active voxels. Isosurfaces are typically very sparse, with just 4.5%-45% of the voxels may be active ([check out my paper for some stats](https://www.willusher.io/publications/teraweb)).

## Exclusive Scan

We’ll use a classic work-efficient parallel scan implementation, described for CUDA by  Harris et al. in [GPU Gems 3](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda). Harris et al.’s write-up is excellent, and the translation of it to WebGPU and WGSL is a direct translation of the CUDA code, so here I’ll just cover some details of how scan works to see why it’s useful in a GPU parallel Marching Cubes implementation. 

Exclusive (and inclusive) scans form a common building block of data-parallel algorithms, one common use for it is computing memory offsets for outputting data in parallel, as we need to do for Marching Cubes. This works by first outputting a counts buffer that records how many outputs each input will have. For example, after computing the number of triangles to be output by each voxel we could have a buffer like below:

```python
counts = [0, 3, 2, 0, 0, 5, 4]
```

Now we know how many triangles each voxel will output, but we don’t know where to write them in the output buffer without trampling outputs from other voxels. Exclusive scan to the rescue! The exclusive scan computes the output `y` sum over the input `x` as:

```python
y_0 = 0
y_1 = x_0
y_2 = x_0 + x_1
```

Applying this to our `counts` buffer would produce:

```python
out = [0, 0, 3, 5, 5, 5, 10]
```

To get the total number of outputs we can make our output buffer 1 element larger, resulting in:

```python
out = [0, 0, 3, 5, 5, 5, 10, 14]
```

Given our counts buffer, we’ve now been able to compute that we have 14 total output triangles that we need to allocate room for, and the output addresses for each voxel that will output triangles. Voxel 1 will write to offset 0, voxel 2 will write to offset 3, voxel 5 to offset 5, and voxel 6 to offset 10.

The full implementation for this project can be found in: [exclusive_scan.ts](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/exclusive_scan.ts), and the shaders: [exclusive_scan_prefix_sum.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/exclusive_scan_prefix_sum.wgsl), [exclusive_scan_prefix_sum_blocks.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/exclusive_scan_prefix_sum_blocks.wgsl), and [exclusive_scan_add_block_sums.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/exclusive_scan_add_block_sums.wgsl). The implementation must chunk up dispatches to fit within the WebGPU max compute dispatch size limit, and makes use of bind group dynamic buffer offsets to have shaders access the right subregion of the input buffer when scanning through it in blocks.

## Stream Compaction

The operation we stated simply when describing the parallel algorithm, to just run the triangle count and computation kernels on the active voxels, requires a stream compaction operation to be implemented to run in a data parallel context. Similar to how we need to compute a buffer of the addresses to write each voxel’s outputs to, we need to compute a compact list of the voxel IDs that may contain the isosurface. This operation is typically called “stream compaction”, where we have a set of elements as input along with an array of masks specifying if we want to keep or discard an element. The output will either be the elements themselves, or in our case, the indices of the elements. Fortunately, we can perform this compaction by re-using the exclusive scan operation we just discussed above.

Our masks buffer will have the form:

```python
masks = [1, 0, 0, 1, 1, 0]
```

And computing an exclusive scan on the masks will produce a list of offsets to write the compacted results out to, along with the total number of items (again offsets is 1 element bigger than the masks array)

```python
offsets = [0, 1, 1, 1, 2, 2, 3]
```

With that, all that’s left to do is write a kernel that runs over each input element and writes its index to the specified offset if its mask value was 1!

A more memory efficient implementation is also possible by running the scan in place on the masks buffer and checking if an element is active by checking if:

```python
offset[current] < offset[current + 1]
```

If this is true, it means the current element was active, as it caused the output offset for elements following it to be increased to make room for its output.

The implementation of the stream compaction that compacts the active voxel IDs down based on the offsets buffer is in: [stream_compact_ids.ts](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/stream_compact_ids.ts) and [stream_compact_ids.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/stream_compact_ids.wgsl). The implementation is exactly as described here, with some additional handling to deal with chunking up the scan kernel dispatches when we exceed the max dispatch size.

# Putting it all Together in WebGPU

Now that we’ve implemented our data-parallel primitives: exclusive scan and stream compaction, we’re ready to fill in the Marching Cubes specific parts of the computation to implement our parallel algorithm. There are three stages to the algorithm:

1. Compute active voxel IDs
2. Compute vertex output offsets
3. Compute vertices

After which we can render the computed surface.

## Compute Active Voxel IDs

Computing the list of active voxel IDs consists of three steps:

1. We run a kernel to mark the active voxels, producing the mask buffer
2. Exclusive Scan the mask buffer to produce output offsets for active voxels
3. Compact the active voxel IDs down using the offsets via Stream Compaction

We’ve implemented the primitives for steps 2 and 3, so the last thing to write is a kernel to run over the dual grid that computes if a voxel is active or not. The kernel is a direct translation of the first bit of the pseudocode we saw above performing the early out, except that instead of calling continue it writes a 0 or 1 to the mask buffer.

The full kernel code can be found in [mark_active_voxel.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/mark_active_voxel.wgsl), and is written below in a briefer psuedo-shader form. This kernel is run for every voxel in the Dual Grid to produce the mask buffer in parallel.

```glsl
float values[8] = compute_voxel_values(voxel_id);
uint case_index = compute_case_index(values, isovalue);
voxel_active[voxel_idx] = case_index != 0 && case_index != 255 ? 1 : 0;
```

## Compute Vertex Output Offsets and Count

Now that we have a list of all the voxels that may output triangles, we can compute how many triangles each one will output to determine the output offsets and total triangle count. This is done using a kernel [compute_num_verts.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/compute_num_verts.wgsl), that is run in parallel over the active voxel IDs and outputs the number of vertices that voxel will output. Since we’re not using indexed rendering, every 3 vertices forms a triangle.

The compute num verts kernel computes the number of output vertices for a voxel using the [Marching Cube case table](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/mc_case_table.ts). As we saw in the first sketch showing the calculation for a single voxel, the case table defines the edges of the voxel that the triangle’s vertices lie on, and marks the end of the sequence with a -1. Thus, our kernel can load the voxel’s values, compute the case index, and then loop through the case table values for that case to compute the number of vertices that will be output:

```glsl
float values[8] = compute_voxel_values(voxel_id);
uint case_index = compute_case_index(values, isovalue);
int triangulation[16] = case_table[case_index];
uint num_verts = 0;
for (uint i = 0; i < 16 && triangulation[i] != -1; ++i) {
    ++num_verts;
}
voxel_num_verts[work_item] = num_verts;
```

We then perform an exclusive scan on the `voxel_num_verts` output buffer to compute the output offsets for each voxel and the total number of vertices to be output.

## Compute Vertices

With the output offsets ready and the output vertex buffer allocated, all that’s left to do is actually compute and output the vertices! This is done by the kernel [compute_vertices.wgsl](https://github.com/Twinklebear/webgpu-marching-cubes/blob/main/src/compute_vertices.wgsl). It takes the list of active voxel IDs and the output offsets computed previously and computes the vertices for each voxel and writes them to the output. This kernel is run in parallel over all active voxels.

The vertices for each voxel are computed by looping through the triangulation for its case and lerp’ing between the vertices at the end of each edge by the field value to compute the position where the isosurface intersects the edge. The vertex is first computed in the unit voxel, then offset by the voxel’s position in the volume grid and the 0.5 offset of the Dual Grid. This is written below in pseudo-shader code, see the kernel code on Github for the full code.

```glsl
float values[8] = compute_voxel_values(voxel_id);
uint case_index = compute_case_index(values, isovalue);
int triangulation[16] = case_table[case_index];
uint output_offset = vertex_offsets[work_item];
for (uint i = 0; i < 16 && triangulation[i] != -1; ++i) {
    // Lerp the edge start/end vertices to find where the isosurface
    // intersects the edge
    uint v0 = edge_start_vertex(triangulation[i]);
    uint v1 = edge_end_vertex(triangulation[i]);
    float t = (isovalue - values[v0]) / (values[v1] - values[v0]);
    vec3 v = lerp(voxel_pos[v0], voxel_pos[v1], t);
    
    // Now offset v by the voxel position in the dual grid and output
    output_vertices[output_offset + i] = v + voxel_pos + 0.5;
}
```

## Render Surface

Computing the surface took a bit of work and quite a few compute passes across all our kernels! Fortunately, rendering it is very simple. The output of our compute vertices pass is a triangle soup with all the vertices for all voxels written out as an unindexed list of triangles that we can simply draw as a “triangle-list” topology geometry without an index buffer.

# Conclusion: WebGPU Performance vs. Vulkan

With our implementation done, it’s time to see how it stacks up against a native Vulkan implementation! I’ve implemented the exact same code in Vulkan, which you can find [here on Github](https://github.com/Twinklebear/vulkan-marching-cubes). For these tests we’ll use a few small datasets from [OpenScivisDatasets](https://klacansky.com/open-scivis-datasets/index.html), the Skull, Bonsai, Foot and Aneurysm. Each dataset is 256x256x256 for a total of 16.77M cells (the dual grid has 16.58M cells).

In both methods I ran a sweep up the isovalue from 30 to 110, covering isosurfaces of interest to a typical user (i.e., not too much noise, not too small). The performance results are shown in the table below on a MBP with an M2 Max, and an RTX 3080. The RTX 3080 is used for the WebGPU vs. Vulkan performance comparisons, where we find that performance on average is very close to the native Vulkan version!

<table class="table">
<thead>
<th scope="col" class="text-left">Dataset</th>
<th scope="col" class="text-right">WebGPU (M2 Max)</th>
<th scope="col" class="text-right">WebGPU (RTX 3080)</th>
<th scope="col" class="text-right">Vulkan (RTX 3080)</th>
</thead>
<tbody>
<tr>
  <th scope="row" class="text-left">Skull</th>
  <td class="text-right">43.5ms</td>
  <td class="text-right">32ms</td>
  <td class="text-right">30.92ms</td>
</tr>
<tr>
  <th scope="row" class="text-left">Bonsai </th>
  <td class="text-right">42.5ms</td>
  <td class="text-right">31ms</td>
  <td class="text-right">29.3ms</td>
</tr>
<tr>
  <th scope="row" class="text-left">Foot </th>
  <td class="text-right">54.4ms</td>
  <td class="text-right">32.5ms</td>
  <td class="text-right">33.43ms</td>
</tr>
<tr>
  <th scope="row" class="text-left">Aneurysm </th>
  <td class="text-right">40.8ms</td>
  <td class="text-right">37.5ms</td>
  <td class="text-right">27.45ms</td>
</tr>
</tbody>
</table>

Having access to a modern low-overhead GPU API in the browser is really exciting, and opens up a ton of new possibilities for games, content creation tools, scientific applications and more to run in the browser with near native performance. Currently this application will only run in Chrome, but Safari and Firefox are working hard on WebGPU development. I’m looking forward to the day that WebGPU support is widespread across vendors!

## Live Demo and Code

The code for the WebGPU marching cubes implementation is available on [Github](https://github.com/Twinklebear/webgpu-marching-cubes), and should be runnable below in Chrome. Firefox Nightly and Safari Tech Preview aren’t quite yet able to run it at the time of writing this post. You can also try it out here: [https://www.willusher.io/webgpu-marching-cubes/](https://www.willusher.io/webgpu-marching-cubes/)

<div class="ratio ratio-4x3">
<iframe src="https://www.willusher.io/webgpu-marching-cubes/#Bonsai"></iframe>
</div>

