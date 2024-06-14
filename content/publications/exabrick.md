---
layout: publication
title: Ray Tracing Structured AMR Data Using ExaBricks
date: 2021-01-01
params:
  authors: Ingo Wald, Stefan Zellmann, Will Usher, Nate Morrical, Ulrich Lang, and Valerio Pascucci
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/16R2_cbd6U_50HAX5jeermaHHN_u9NOTj/view?usp=sharing
  teaser: https://cdn.willusher.io/img/9upElMb.webp
  thumb: https://cdn.willusher.io/img/4Ghd7BO.webp
  year: 2021
  short_title: exabrick
  selected: true
  doi: 10.1109/TVCG.2020.3030470
  arxiv: 2009.03076 
  bibtex: >
    @article{wald_exabrick_2021,
      author={Wald, Ingo and Zellmann, Stefan and Usher, Will and Morrical, Nate
          and Lang, Ulrich and Pascucci, Valerio},
      journal={{IEEE} {Transactions} on {Visualization} and {Computer} {Graphics}},
      title={{Ray} {Tracing} {Structured} {AMR} {Data} {Using} {ExaBricks}},
      doi={10.1109/TVCG.2020.3030470},
      year={2021}
    }
  abstract: >
    Structured Adaptive Mesh Refinement (Structured AMR) enables simulations to adapt
      the domain resolution to save computation and storage, and has become one of the dominant
      data representations used by scientific simulations; however, efficiently rendering such
      data remains a challenge. We present an efficient approach for volume- and iso-surface ray
      tracing of Structured AMR data on GPU-equipped workstations, using a combination of two different
      data structures. Together, these data structures allow a ray tracing based renderer to quickly
      determine which segments along the ray need to be integrated and at what frequency, while also
      providing quick access to all data values required for a smooth sample reconstruction kernel.
      Our method makes use of the RTX ray tracing hardware for surface rendering, ray marching, space skipping,
      and adaptive sampling; and allows for interactive changes to the transfer function and implicit
      iso-surfacing thresholds. We demonstrate that our method achieves high performance with little
      memory overhead, enabling interactive high quality rendering of complex AMR data sets on
      individual GPU workstation.
  teaser_caption: >
    The Exajet contains an AMR simulation of air flow around the left side of a plane,
      and consists of 656M cells (across four refinement levels) plus 63.2M triangles. For rendering we
      mirror the data set via instancing, resulting in effectively 1.31B instanced cells and 126M instanced
      triangles. This visualization—rendered with our method—shows flow vorticity and velocity, with an
      implicitly ray-traced iso-surface of the vorticity (color-mapped by velocity), plus volume ray tracing of
      the vorticity field. At a resolution of 2500×625, and running on a workstation with two RTX 8000 GPUs,
      this configuration renders in roughly 252 milliseconds.
  extra_links:
  - title: Presentation
    link: https://youtu.be/s6CZzP6zT7s?start=3183
    image: /img/youtube.svg
  - title: Supplemental Video
    link: https://youtu.be/r8G2qECeoqU
    image: /img/youtube.svg

---
