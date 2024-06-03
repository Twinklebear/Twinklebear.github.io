---
layout: publication
title: CPU Ray Tracing of Tree-Based Adaptive Mesh Refinement Data
date: 2020-03-25
params:
  authors: Feng Wang, Nathan Marshak, Will Usher, Carsten Burstedde, Aaron Knoll, Timo Heister, and Chris R. Johnson
  venue: Computer Graphics Forum
  paper_pdf: https://drive.google.com/file/d/18B56OVnmAtf36bRWNRquXHp-pJtJWXIq/view?usp=sharing
  teaser: https://cdn.willusher.io/img/bwoCE0y.webp
  thumb: https://cdn.willusher.io/img/jpqy4ym.webp
  year: 2020
  short_title: tamr
  doi: 10.1111/cgf.13958
  selected: true
  bibtex: >
    @article{wang_tamr_20,
      journal = {Computer Graphics Forum},
      title = {{CPU Ray Tracing of Tree-Based Adaptive Mesh Refinement Data}},
      author = {Wang, Feng and Marshak, Nathan and Usher, Will and
          Burstedde, Carsten and Knoll, Aaron and Heister, Timo
          and Johson, Chris R.},
      DOI = {10.1111/cgf.13958},
      year = {2020}
    }
  abstract: >
    Adaptive mesh refinement (AMR) techniques allow for representing a simulation’s computation domain in an adaptive fashion. Although these techniques have found widespread adoption in high-performance computing simulations, visualizing their data output interactively and without cracks or artifacts remains challenging. In this paper, we present an efficient solution for direct volume rendering and hybrid implicit isosurface ray tracing of tree-based AMR (TB-AMR) data. We propose a novel reconstruction strategy, Generalized Trilinear Interpolation (GTI), to interpolate across AMR level boundaries without cracks or discontinuities in the surface normal. We employ a general sparse octree structure supporting a wide range of AMR data, and use it to accelerate volume rendering, hybrid implicit isosurface rendering and value queries. We demonstrate that our approach achieves artifact-free isosurface and volume rendering and provides higher quality output images compared to existing methods at interactive rendering rates.
  teaser_caption: >
    High-fidelity visualization (volume and implicit isosurface rendering) of the NASA ExaJet dataset (field: vorticity). This dataset contains 656M cells (1.31B after instancing) of adaptive resolution and 63.2M triangles (126M after instancing). This 2400×600 image is rendered on a workstation with four Intel Xeon E7-8890 v3 CPUs (72 cores, 2.5 GHz) at a framerate of 6.64 FPS. We show that our system has the capability of ray tracing TB-AMR data in combination with advanced shading effects like ambient occlusion and path tracing.
  extra_links:
  - title: Presentation
    link: https://youtu.be/CE20fwd77EY
    image: /img/youtube.svg
  - title: Supplemental Video
    link: https://youtu.be/pVd9Fpv2yoE
    image: /img/youtube.svg
  - title: Appendix
    link: https://drive.google.com/file/d/18TgoQyP7XLHoIWIAYZizgBCnHxo1fIIp/view?usp=sharing
    image: /img/pdf.svg
  - title: SimPy Notebook
    link: https://drive.google.com/file/d/18RfsxL1CMcp4rZAUtqeJyGSwBVQzNzhd/view?usp=sharing
    image: /img/file_archive.svg
  - title: OSPRay TB-AMR Module
    link: https://github.com/ethan0911/TB-AMR
    image: /img/github.svg

---
