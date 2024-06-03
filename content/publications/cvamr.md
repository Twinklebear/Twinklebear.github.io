---
layout: publication
title: CPU Volume Rendering of Adaptive Mesh Refinement Data
date: 2017-11-27
params:
  authors: Ingo Wald, Carson Brownlee, Will Usher, and Aaron Knoll"
  venue: SIGGRAPH Asia 2017 Symposium on Visualization
  paper_pdf: https://drive.google.com/file/d/17o7hAcQruhgj4W2BpUhuBYTAoC8ELq5k/view?usp=sharing
  teaser: https://cdn.willusher.io/img/CqZc3VJ.webp
  thumb: https://cdn.willusher.io/img/JFShB4G.webp
  year: 2017
  short_title: cvamr
  doi: 10.1145/3139295.3139305
  bibtex: >
    @inproceedings{Wald_CVAMR_2017,
      author = {Wald, Ingo and Brownlee, Carson and Usher, Will and Knoll, Aaron},
      title = {CPU Volume Rendering of Adaptive Mesh Refinement Data},
      booktitle = {SIGGRAPH Asia 2017 Symposium on Visualization},
      series = {SA '17},
      year = {2017},
      isbn = {978-1-4503-5411-0},
      location = {Bangkok, Thailand},
      pages = {9:1--9:8},
      articleno = {9},
      numpages = {8},
      url = {http://doi.acm.org/10.1145/3139295.3139305},
      doi = {10.1145/3139295.3139305},
      acmid = {3139305},
      publisher = {ACM},
      address = {New York, NY, USA},
    }
  abstract: >
    Adaptive Mesh Refinement (AMR) methods are widespread
    in scientific computing, and visualizing the resulting data with
    efficient and accurate rendering methods can be vital for enabling 
    interactive data exploration.
    In this work, we
    detail a comprehensive solution for directly volume rendering block-structured 
    (Berger-Colella) AMR data in the
    OSPRay interactive CPU ray tracing framework. In particular, we
    contribute a general method for representing and traversing AMR data
    using a kd-tree structure, and four different reconstruction
    options, one of which in particular (the basis function approach)
    is novel compared to existing methods. We demonstrate our system on two
    types of block-structured AMR data and compressed scalar
    field data, and show how it can be easily used in existing production-ready
    applications through a prototypical integration in the widely used visualization program ParaView.
  teaser_caption: >
    Two examples of our method (integrated within the OSPRay ray tracer):
    Left: 1.8GB Cosmos AMR data, rendered in ParaView. Right: a 57GB NASA Chombo simulation,
    rendered with ambient occlusion and shadows alongside mesh geometry.

---
