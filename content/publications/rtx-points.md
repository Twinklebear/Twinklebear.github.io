---
layout: publication
title: "RTX Beyond Ray Tracing: Exploring the Use of Hardware Ray Tracing Cores for Tet-Mesh Point Location"
date: 2019-07-08
params:
  authors: Ingo Wald, Will Usher, Nate Morrical, Laura Lediaev, and Valerio Pascucci
  venue: High Performance Graphics Short Papers
  paper_pdf: https://drive.google.com/file/d/170SJlGIzFGmBhYiw9PT6ivuoWC1p8x1Y/view?usp=sharing
  teaser: https://cdn.willusher.io/img/clMvtsl.webp
  thumb: https://cdn.willusher.io/img/nbHnD45.webp
  year: 2019
  short_title: rtx-points
  doi: 10.2312/hpg.20191189
  selected: true
  bibtex: >
    @inproceedings{wald_rtx_2019,
      title = {{RTX} {Beyond} {Ray} {Tracing:} {Exploring} the {Use} of {Hardware}
          {Ray} {Tracing} {Cores} for {Tet}-{Mesh} {Point} {Location}},
      booktitle = {High-Performance Graphics - Short Papers},
      author = {Wald, Ingo and Usher, Will and Morrical, Nate
          and Lediaev, Laura and Pascucci, Valerio},
      year = {2019},
      DOI = {10.2312/hpg.20191189}
    }
  abstract: >
    We explore a first proof-of-concept example of creatively using the
      Turing generation's hardware ray tracing cores to solve a problem
      other than classical ray tracing, specifically, point location in
      unstructured tetrahedral meshes. Starting with a CUDA reference
      method, we describe and evaluate three different approaches to
      reformulate this problem in a manner that allows it to be mapped
      to these new hardware units. Each variant replaces the simpler problem
      of point queries with the more complex one of ray queries; however,
      thanks to hardware acceleration, these approaches are actually
      faster than the reference method.
  teaser_caption: >
    a-c) Illustrations of the tetrahedral mesh point location
    kernels evaluated in this paper. a) Our reference method builds a BVH over
    the tets and performs both BVH traversal and point-in-tet tests in software
    (black) using CUDA. b) `rtx-bvh` uses an
    RTX-accelerated BVH over tets and
    triggers hardware BVH traversal (green) by tracing infinitesimal rays at the
    sample points, while still performing point-tet tests in software (black).
    c) `rtx-rep-faces` and
    `rtx-shrd-faces` use both hardware BVH traversal and
    triangle intersection (green) by tracing rays against the tetrahedras' faces.
    d) An image from the unstructured-data volume ray marcher used to evaluate
    our point location kernels, showing the 35.7M tet Agulhas Current data
    set rendered interactively on an NVIDIA TITAN RTX (34FPS at 1024^2 pixels).

---
