---
layout: publication
title: A Comparison of Rendering Techniques for 3D Line Sets with Transparency
date: 2020-02-24
params:
  authors: Michael Kern, Christoph Neuhauser, Torben Maack, Mengjiao Han, Will Usher, and Rüdiger Westermann
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/18B0gt_TAQdOeNEadics_jMeMcMx6zUCn/view?usp=sharing
  teaser: https://cdn.willusher.io/img/Sceg1iM.webp
  thumb: https://cdn.willusher.io/img/Yy9H2ZR.webp
  year: 2020
  short_title: tvcg20_oit
  doi: 10.1109/TVCG.2020.2975795
  bibtex: >
    @article{kern_comparison_20,
    journal = {IEEE Transactions on Visualization and Computer Graphics},
    title = {{A Comparison of Rendering Techniques for 3D Line Sets with Transparency}},
    author = {Kern, Michael and Neuhauser, Christoph and Maack, Torben and Han, Mengjiao and
        Usher, Will and Westermann, Rüdiger},
    year = {2020},
    DOI = {10.1109/TVCG.2020.2975795}
    }
  abstract: >
    This paper presents a comprehensive study of rendering techniques for 3D line sets with transparency. The rendering of transparent lines is widely used for visualizing trajectories of tracer particles in flow fields. Transparency is then used to fade out lines deemed unimportant, based on, for instance, geometric properties or attributes defined along with them. Accurate blending of transparent lines requires rendering the lines in back-to-front or front-to-back order, yet enforcing this order for space-filling 3D line sets with extremely high-depth complexity becomes challenging. In this paper, we study CPU and GPU rendering techniques for transparent 3D line sets. We compare accurate and approximate techniques using optimized implementations and several benchmark data sets. We discuss the effects of data size and transparency on quality, performance, and memory consumption. Based on our study, we propose two improvements to per-pixel fragment lists and multi-layer alpha blending. The first improves the rendering speed via an improved GPU sorting operation, and the second improves rendering quality via transparency-based bucketing.",
  teaser_caption: >
    Strengths and weaknesses of transparent line rendering techniques. For each pair, the left image shows the ground truth (GT). Right images show (a) approximate blending using MLABDB, (b) opacity over-estimation of MBOIT, (c) reverse blending order of MLABDB, (d) blur effect of MBOIT. Speed-ups to GT rendering technique: (a) 7, (b) 2, (c) 3.5, (d) 4.5.
  extra_links:
  - title: Appendices
    link: https://drive.google.com/file/d/1854-d-vSlh36lw_FDU-HW5OLHODXtXHz/view?usp=sharing
    image: /img/pdf.svg
  - title: Benchmark Framework and GPU Rendering Algorithms
    link: https://github.com/chrismile/PixelSyncOIT
    image: /img/github.svg
  - title: OSPRay Generalized Tubes Module
    link: https://github.com/MengjiaoH/ospray-module-tubes
    image: /img/github.svg
  - title: Line Data Sets
    link: http://doi.org/10.5281/zenodo.3637625
    image: /img/file_archive.svg
  - title: RTX Ray Tracing Test Framework
    link: http://doi.org/10.5281/zenodo.3637621
    image: /img/file_archive.svg

---
