---
title: Approximate Puzzlepiece Compositing
layout: publication
date: 2025-01-26
params:
  authors: Xuan Huang, Will Usher, Valerio Pascucci
  venue: IEEE Transactions on Visualization and Computer Graphics (To Appear)
  paper_pdf: https://drive.google.com/file/d/1OBXEBP2uIR8DL-dImEkHnllAzAfKaur2/view?usp=sharing
  thumb: https://cdn.willusher.io/img/apc-pvis25-thumb.jpg
  teaser: https://cdn.willusher.io/img/apc-pvis25-teaser.jpg
  year: 2025
  short_title: apc-pvis25
  selected: true
  arxiv: 2501.12581
  bibtex: >
    @article{huang_apc,
      author={Huang, Xuan and Usher, Will and Pascucci, Valerio},
      journal={IEEE Transactions on Visualization and Computer Graphics}, 
      title={Approximate Puzzlepiece Compositing},
      year={2025},
      }
  abstract: >
    The increasing demand for larger and higher fidelity simulations has made Adaptive Mesh Refinement (AMR) and
    unstructured mesh techniques essential to focus compute effort and memory cost on just the areas of interest in the simulation domain.
    The distribution of these meshes over the compute nodes is often determined by balancing compute, memory, and network costs,
    leading to distributions with jagged nonconvex boundaries that fit together much like puzzle pieces. It is expensive, and sometimes
    impossible, to re-partition the data posing a challenge for in situ and post hoc visualization as the data cannot be rendered using
    standard sort-last compositing techniques that require a convex and disjoint data partitioning. We present a new distributed volume
    rendering and compositing algorithm, Approximate Puzzlepiece Compositing, that enables fast and high-accuracy in-place rendering of
    AMR and unstructured meshes. Our approach builds on Moment-Based Ordered-Independent Transparency to achieve a scalable,
    order-independent compositing algorithm that requires little communication and does not impose requirements on the data partitioning.
    We evaluate the image quality and scalability of our approach on synthetic data and two large-scale unstructured meshes on HPC
    systems by comparing to state-of-the-art sort-last compositing techniques, highlighting our approach’s minimal overhead at higher
    core counts. We demonstrate that Approximate Puzzlepiece Compositing provides a scalable, high-performance, and high-quality
    distributed rendering approach applicable to the complex data distributions encountered in large-scale CFD simulations.
  teaser_caption: >
    Large-scale moment-based order-independent (MBOIT) distributed transparency rendering with the FUN3D Mars Lander
    A/143M dataset, consisting of 72 subdomains and 798M elements. Figures (a) and (b) are rendered at 2560×2560 using TACC
    Frontera Intel Xeon Platinum 8280 ("Cascade Lake") nodes with 192GB memory. (c) A heatmap of the per-pixel segment counts with a
    range of [0, 28]. The segment lists must be individually sorted and blended in sort-last compositing due to the overlapping boundaries
    of data on the ranks, resulting in large data transfers and bottlenecks. Our approach ensures a constant, fixed, and small amount of
    communication for compositing arbitrary data distributions.
---

