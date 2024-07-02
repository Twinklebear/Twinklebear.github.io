---
title: Interactive Isosurface Visualization in Memory Constrained Environments Using Deep Learning and Speculative Raycasting
layout: publication
date: 2024-07-01
params:
  authors: Landon Dyken, Will Usher, Sidharth Kumar
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/1nxbCFArvHz-6HdR1oCn5PORzVu6R7d3P/view?usp=drive_link
  thumb: https://cdn.willusher.io/img/prog-iso-ml-tvcg24-thumb.jpg
  teaser: https://cdn.willusher.io/img/prog-iso-ml-tvcg24-teaser.jpg
  year: 2024
  short_title: prog-iso-ml-tvcg24
  selected: true
  doi: 10.1109/TVCG.2024.3420225
  bibtex: >
    @article{dyken_prog_iso_ml,
      author={Dyken, Landon and Usher, Will and Kumar, Sidharth},
      journal={IEEE Transactions on Visualization and Computer Graphics}, 
      title={Interactive Isosurface Visualization in Memory Constrained Environments Using Deep Learning and Speculative Raycasting}, 
      year={2024},
      doi={10.1109/TVCG.2024.3420225}}
  abstract: >
    New web technologies have enabled the deployment of powerful GPU-based computational pipelines that run entirely in the web browser, opening a new frontier for accessible scientific visualization applications. However, these new capabilities do not address the memory constraints of lightweight end-user devices encountered when attempting to visualize the massive data sets produced by today's simulations and data acquisition systems. We propose a novel implicit isosurface rendering algorithm for interactive visualization of massive volumes within a small memory footprint. We achieve this by progressively traversing a wavefront of rays through the volume and decompressing blocks of the data on-demand to perform implicit ray-isosurface intersections, displaying intermediate results each pass. We improve the quality of these intermediate results using a pretrained deep neural network that reconstructs the output of early passes, allowing for interactivity with better approximates of the final image. To accelerate rendering and increase GPU utilization, we introduce speculative ray-block intersection into our algorithm, where additional blocks are traversed and intersected speculatively along rays to exploit additional parallelism in the workload. Our algorithm is able to trade-off image quality to greatly decrease rendering time for interactive rendering even on lightweight devices. Our entire pipeline is run in parallel on the GPU to leverage the parallel computing power that is available even on lightweight end-user devices. We compare our algorithm to the state of the art in low-overhead isosurface extraction and demonstrate that it achieves 1.7× – 5.7× reductions in memory overhead and up to 8.4× reductions in data decompressed.
  teaser_caption: >
    Isosurface visualization of the 2048×2048×1920 Richtmyer-Meshkov (R-M) data set in the browser. Our method renders this 32.2GB volume using just 4.2GB of memory. Left: after 85% of rays have completed traversal (active rays colored red); Middle: machine learning infill and reconstruction on the 85% image; Right: ground truth. We propose a new GPU algorithm for implicit isosurface rendering that progressively traverses rays through the volume and decompresses data on-demand to minimize memory requirements. Intermediate results can be drastically improved by reconstruction with our pretrained deep learning network. At 1280×720, the Richtmyer-Meshkov reaches 85% completion in 339ms and 100% completion in 911ms on a laptop RTX 4070. Inference time takes 68ms using ONNX Runtime Web, and only 16ms using TensorRT. We achieve up to 5.7× reductions in overall memory use and 8.4× reductions in data decompressed compared to the state of the art in memory constrained isosurface extraction
  extra_links:
  - title: Code
    link: https://github.com/ldyken53/TVCG-progiso
    image: /img/github.svg
  - title: Live Demo!
    image: /img/rocket.svg
    link: https://ldyken53.github.io/TVCG-progiso/#dataset=magnetic
---

