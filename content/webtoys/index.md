---
layout: webtoys
title: Web Toys

---
This page highlights the WebGPU, WebGL, WebAssembly based visualization and rendering
toys I've written with a goal of exploring how scivis tools can become
as readily available and easily deployable on the web as infovis ones. Although the
browser still imposes restrictions on the visualization system's ability to render and
work with large data sets or perform expensive computations,
[WebGPU](https://gpuweb.github.io/gpuweb/) provides access to a modern native API,
and the widely available
[WebGL2](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
and [WebAssembly](https://webassembly.org/) help push the browser's abilities
beyond what was previously possible.
WebGL2 enables the browser to support the core rendering
features needed for scivis (3D textures, floating point images, fixed function fragment operations, etc.).
WebGPU goes even further and enables support for compute shaders, storage buffers, and lower
CPU overhead rendering.
WebAssembly allows for recompiling existing scivis libraries to fast, portable byte-code, or
compiling new code for the browser without sacrificing performance. Furthermore, WebAssembly can
also be executed outside of the browser, or JIT'd to native code, enabling users to easily transition
from the browser to a native tool when working with larger data sets or computations which need
native code performance or multithreading.
Proposed future technologies
for the browser can enable even more powerful algorithms, WebGPU could enable data-parallel computation
through compute shaders, while shared memory multi-threading would enable multi-threaded CPU execution
of both Javascript and WebAssembly. Both technologies would allow tools to tap much of the compute available
across a range of platforms.

The toys listed below explore various aspects of these technologies. The WebGL Volume Raycaster implements
a standard volume raycaster using 3D textures in WebGL2. The EWA Surface Splatter implements
a splat-based renderer for visualizing point cloud data. The WebGL Marching Cubes example compares
the performance of marching cubes implemented in pure Javascript vs. Rust compiled to WebAssembly,
the WebAssembly version is 10-50x faster!
The WebGL Neuron Visualizer uses libtiff compiled to WebAssembly to allow loading microscopy data
into the browser to be rendered with WebGL.

