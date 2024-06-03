---
layout: publication
title: Accelerating Unstructured Mesh Point Location with RT Cores
date: 2020-12-01
params:
  authors: Nate Morrical, Ingo Wald, Will Usher, Valerio Pascucci
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/170DhS1Bwy-aPcDAvNgBwZJR9MaiHfmnS/view?usp=sharing
  teaser: https://cdn.willusher.io/img/5CpRXQc.webp
  thumb: https://cdn.willusher.io/img/x6hLYl8.webp
  year: 2020
  short_title: rtx-points-tvcg
  selected: true
  doi: 10.1109/TVCG.2020.3042930
  bibtex: >
    @article{morrical_rtxpoints_2020,
      author={Morrical, Nate and Wald, Ingo and Usher, Will and Pascucci, Valerio},
      journal={{IEEE} {Transactions} on {Visualization} and {Computer} {Graphics}},
      title={{Accelerating} {Unstructured} {Mesh} {Point} {Location} with {RT} {Cores}},
      doi={10.1109/TVCG.2020.3042930},
      year={2020}
    }
  abstract: >
    We present a technique that leverages ray tracing hardware available in recent Nvidia RTX GPUs to solve a problem other than classical
      ray tracing. Specifically, we demonstrate how to use these units to accelerate the point location of general unstructured elements consisting of both
      planar and bilinear faces. This unstructured mesh point location problem has previously been challenging to accelerate on GPU architectures; yet, the
      performance of these queries is crucial to many unstructured volume rendering and compute applications. Starting with a CUDA reference method,
      we describe and evaluate three approaches that reformulate these point queries to incrementally map algorithmic complexity to these new hardware
      ray tracing units. Each variant replaces the simpler problem of point queries with a more complex one of ray queries. Initial variants exploit ray
      tracing cores for accelerated BVH traversal, and subsequent variants use ray-triangle intersections and per-face metadata to detect point-in-element
      intersections. Although these later variants are more algorithmically complex, they are significantly faster than the reference method thanks to
      hardware acceleration. Using our approach, we improve the performance of an unstructured volume renderer by up to 4× for tetrahedral meshes and
      up to 15× for general bilinear element meshes, matching, or out-performing state-of-the-art solutions while simultaneously improving on robustness
      and ease-of-implementation.
  teaser_caption: >
    The Agulhas Current dataset, courtesy Niklas Röber, DKRZ.
      This image shows simulated ocean currents off the coast of South Africa,
      represented using cell-centered wedges. When rendered using our hardware
      accelerated point queries, we see up to a 14.86× performance
      improvement over a CUDA reference implementation (2.49 FPS vs 37 FPS on an RTX 2080 at 1024×1024).

---
