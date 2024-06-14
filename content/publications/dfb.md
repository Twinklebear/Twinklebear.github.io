---
layout: publication
title: Scalable Ray Tracing Using the Distributed FrameBuffer
date: 2019-07-10
params:
  authors: Will Usher, Ingo Wald, Jefferson Amstutz, Johannes Günther, Carson Brownlee, and Valerio Pascucci
  venue: Computer Graphics Forum (Proceedings of EuroVis)
  paper_pdf: https://drive.google.com/file/d/16_Kb1suTsWtlR1D4aYjlA-QYJ1fSkHp7/view?usp=sharing
  teaser: https://cdn.willusher.io/img/xDw1wI1.webp
  thumb: https://cdn.willusher.io/img/xVd40uT.webp
  year: 2019
  short_title: dfb
  doi: 10.1111/cgf.13702
  arxiv: 2305.07083
  selected: true
  bibtex: >
    @article{usher_scalable_2019,
      journal = {Computer Graphics Forum},
      title = {{Scalable Ray Tracing Using the Distributed FrameBuffer}},
      author = {Usher, Will and Wald, Ingo and Amstutz, Jefferson and
          Günther, Johannes and Brownlee, Carson and Pascucci, Valerio},
      year = {2019},
      publisher = {The Eurographics Association and John Wiley & Sons Ltd.},
      ISSN = {1467-8659},
      DOI = {10.1111/cgf.13702}
    }
  abstract: >
    Image- and data-parallel rendering across multiple
      nodes on high-performance computing systems is widely used in visualization
      to provide higher frame rates, support large data sets, and
      render data in situ. Specifically for in situ visualization,
      reducing bottlenecks incurred by the visualization and compositing is
      of key concern to reduce the overall simulation runtime.
      Moreover, prior algorithms have been designed to support either
      image- or data-parallel rendering and impose restrictions on the
      data distribution, requiring different implementations for each
      configuration. In this paper, we introduce the Distributed FrameBuffer,
      an asynchronous image-processing framework for multi-node rendering.
      We demonstrate that our approach achieves performance superior to
      the state of the art for common use cases, while providing the
      flexibility to support a wide range of parallel rendering algorithms
      and data distributions. By building on this framework, we extend
      the open-source ray tracing library OSPRay with a data-distributed API, enabling
      its use in data-distributed and in situ visualization applications.
  teaser_caption: >
    Large-scale interactive visualization using the Distributed FrameBuffer.
      Top left: Image-parallel rendering of two transparent isosurfaces from
      the Richtmyer-Meshkov (516M triangles), 8FPS with a 2048^2
      framebuffer using 16 Stampede2 Intel Xeon Platinum 8160 SKX nodes.
      Top right: Data-parallel rendering of the Cosmic Web (29B transparent spheres),
      2FPS at 2048^2 using 128 Theta Intel Xeon Phi Knight's Landing (KNL) nodes.
      Bottom: Data-parallel rendering of the 951GB DNS volume combined with a transparent
      isosurface (4.35B triangles), 5FPS at 4096x1024 using 64 Stampede2 Intel Xeon Phi
      KNL nodes.
  extra_links:
  - title: Supplemental Video
    link: https://youtu.be/F2nahk4GAB0
    image: /img/youtube.svg
  - title: OSPRay
    link: https://github.com/ospray/ospray
    image: /img/github.svg
  - title: Distributed Rendering Benchmark App
    link: https://github.com/Twinklebear/osp-distrib-viewer
    image: /img/github.svg
  - title: IceT Comparison App
    link: https://github.com/Twinklebear/osp-icet
    image: /img/github.svg

---
