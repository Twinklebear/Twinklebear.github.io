---
title: Speculative Progressive Raycasting for Memory Constrained Isosurface Visualization of Massive Volumes
layout: publication
date: 2023-10-23
params:
  authors: Will Usher, Landon Dyken, Sidharth Kumar
  venue: IEEE Symposium on Large Data Analysis and Visualization (LDAV)
  paper_pdf: https://drive.google.com/file/d/1COYwLhFFqFvQkPeaj9gIgUk3EG54n4pj/view?usp=sharing
  thumb: https://cdn.willusher.io/img/wgpu-prog-iso-thumb.webp
  teaser: https://cdn.willusher.io/img/wgpu-prog-iso-teaser.webp
  year: 2023
  short_title: wgpu-prog-iso
  selected: true
  award: Best Paper
  doi: 10.1109/LDAV60332.2023.00007
  bibtex: >
    @inproceedings{usher_speculative_2023,
        booktitle = {13th IEEE Symposium on Large Data Analysis and Visualization},
        title = {{Speculative} {Progressive} {Raycasting} for {Memory}
          {Constrained} {Isosurface} {Visualization} of {Massive} {Volumes}},
        author = {Usher, Will and Dyken, Landon and Kumar, Sidharth},
        year = {2023},
        doi = {10.1109/LDAV60332.2023.00007},
    }
  abstract: >
    New web technologies have enabled the deployment of powerful GPU-based computational pipelines that run entirely in the web browser, opening a new frontier for accessible scientific visualization applications. However, these new capabilities do not address the memory constraints of lightweight end-user devices encountered when attempting to visualize the massive data sets produced by today’s simulations and data acquisition systems. In this paper, we propose a novel implicit isosurface rendering algorithm for interactive visualization of massive volumes within a small memory footprint. We achieve this by progressively traversing a wavefront of rays through the volume and decompressing blocks of the data on-demand to perform implicit ray-isosurface intersections. The progressively rendered surface is displayed after each pass to improve interactivity. Furthermore, to accelerate rendering and increase GPU utilization, we introduce speculative ray-block intersection into our algorithm, where additional blocks are traversed and intersected speculatively along rays as other rays terminate to exploit additional parallelism in the workload. Our entire pipeline is run in parallel on the GPU to leverage the parallel computing power that is available even on lightweight end-user devices. We compare our algorithm to the state of the art in low-overhead isosurface extraction and demonstrate that it achieves 1.7×–5.7× reductions in memory overhead and up to 8.4× reductions in data decompressed
  teaser_caption: >
    Interactive full-resolution isosurface visualization of the 2048 × 2048 × 1920 Richtmyer-Meshkov (R-M) data set in the browser. We propose a new GPU algorithm for implicit isosurface rendering that progressively traverses rays through the volume and decompresses data on-demand to minimize its memory footprint. We achieve up to 5.7× reductions in overall memory use and 8.4× reductions in data decompressed compared to the state of the art in memory constrained isosurface extraction, without sacrificing interactivity. At 1280 × 720, the Richtmyer-Meshkov averages 264ms per-pass and 1.2s total on an RTX 3080
  extra_links:
  - title: Code
    link: https://github.com/Twinklebear/webgpu-prog-iso
    image: /img/github.svg
  - title: Live Demo!
    image: /img/rocket.svg
    link: https://www.willusher.io/webgpu-prog-iso/
  - title: Supplemental Video
    image: /img/youtube.svg
    link: https://youtu.be/j8LsGMFEUQU
---
