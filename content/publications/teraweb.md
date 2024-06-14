---
layout: publication
title: >
  Interactive Visualization of Terascale Data in the Browser: Fact or Fiction?
date: 2020-10-27
params:
  authors: Will Usher and Valerio Pascucci
  venue: IEEE Symposium on Large Data Analysis and Visualization (LDAV)
  paper_pdf: https://drive.google.com/file/d/17KFyvR08OFx84MErhmmd_Gc5tjU24WJc/view?usp=sharing
  teaser: https://cdn.willusher.io/img/XmBXWgu.webp
  thumb: https://cdn.willusher.io/img/I2FBGOI.webp
  year: 2020
  short_title: teraweb
  award: Honorable Mention
  doi: 10.1109/LDAV51489.2020.00010
  arxiv: 2009.03254
  selected: true
  bibtex: >
    @inproceedings{usher_teraweb_2020,
      booktitle = {10th IEEE Symposium on Large Data Analysis and Visualization},
      title = {{Interactive Visualization of Terascale Data in the Browser: Fact or Fiction?}},
      author = {Usher, Will and Pascucci, Valerio},
      doi = {10.1109/LDAV51489.2020.00010},
      year = {2020},
    }
  abstract: >
    Information visualization applications have become ubiquitous, in no
      small part thanks to the ease of wide distribution and deployment to
      users enabled by the web browser. Scientific visualization applications,
      relying on native code libraries and parallel processing,
      have been less suited to such widespread distribution, as browsers
      do not provide the required libraries or compute capabilities.
      In this paper, we revisit this gap in visualization technologies and explore
      how new web technologies, WebAssembly and WebGPU,
      can be used to deploy powerful visualization solutions 
      for large-scale scientific data in the browser.
      In particular, we evaluate the programming effort required to bring
      scientific visualization
      applications to the browser through these technologies and assess
      their competitiveness against classic native solutions.
      As a main example, we present a new GPU-driven isosurface
      extraction method for block-compressed data sets,
      that is suitable for interactive isosurface computation
      on large volumes in resource-constrained environments, such as the browser.
      We conclude that web browsers are on the verge of becoming a
      competitive platform for even the most demanding scientific visualization
      tasks, such as interactive visualization of isosurfaces from a 1TB DNS simulation.
      We call on researchers and developers to consider investing
      in a community software stack to ease use of these upcoming browser
      features to bring accessible scientific visualization to the browser.
  teaser_caption: >
    Interactive visualization of an isosurface of a ~1TB dataset entirely in the web browser.
      The full data is a float64 10240×7680×1536 grid computed by a DNS simulation.
      The isosurface is interactively computed and visualized entirely in the browser using our GPU isosurface
      computation algorithm for block-compressed data, 
      after applying advanced precision and resolution trade-offs.
      The surface consists of 137.5M triangles and is computed in 526ms on an RTX 2070 using WebGPU in Chrome
      and rendered at 30FPS at 1280×720.
      The original surface, shown in the right split image, consists of 4.3B triangles and was computed
      with VTK's Flying Edges filter on a quad-socket Xeon server in 78s using 1.3TB of memory.
  extra_links:
  - title: Code
    link: https://github.com/Twinklebear/webgpu-bcmc
    image: /img/github.svg
  - title: Presentation
    link: https://youtu.be/piBNlAZKHAM?start=1000
    image: /img/youtube.svg
  - title: Supplemental Video
    link: https://youtu.be/O7Tboj2dDVA
    image: /img/youtube.svg

---
