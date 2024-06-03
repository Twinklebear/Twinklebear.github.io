---
layout: publication
title: Design and Evaluation of a GPU Streaming Framework for Visualizing Time-Varying AMR Data
date: 2022-05-09
params:
  authors: Stefan Zellmann, Ingo Wald, Alper Sahistan, Matthias Hellmann, Will Usher
  venue: Eurographics Symposium on Parallel Graphics and Visualization
  paper_pdf: https://drive.google.com/file/d/16PYyRugQufJ-ZSJyQ1GHhWG3856hOpsc/view?usp=sharing
  teaser: https://cdn.willusher.io/img/exajet-animated-teaser.webp
  thumb: https://cdn.willusher.io/img/exajet-animated-thumb.webp
  year: 2022
  doi: 10.2312/pgv.20221066
  short_title: exajet-animated
  selected: true
  bibtex: >
    @inproceedings{zellmann_amr_animated_2022,
      booktitle = {Eurographics Symposium on Parallel Graphics and Visualization},
      editor = {Bujack, R. and Tierny, J. and Sadlo, F.},
      title = {{Design} and {Evaluation} of a {GPU} {Streaming} {Framework} for {Visualizing} {Time}-{Varying} {AMR} {Data}},
      author = {Zellmann, Stefan and Wald, Ingo and Sahistan, Alper and Hellmann, Matthias and Usher, Will},
      DOI = {10.2312/pgv.20221066},
      year = {2022},
    }
  abstract: >
    We describe a systematic approach for rendering time-varying simulation data produced by exa-scale simulations, using GPU
      workstations. The data sets we focus on use adaptive mesh refinement (AMR) to overcome memory bandwidth limitations by
      representing interesting regions in space with high detail. Particularly, our focus is on data sets where the AMR hierarchy is fixed
      and does not change over time. Our study is motivated by the NASA Exajet, a large computational fluid dynamics simulation
      of a civilian cargo aircraft that consists of 423 simulation time steps, each storing 2.5 GB of data per scalar field, amounting
      to a total of 4 TB. We present strategies for rendering this time series data set with smooth animation and at interactive rates
      using current generation GPUs. We start with an unoptimized baseline and step by step extend that to support fast streaming
      updates. Our approach demonstrates how to push current visualization workstations and modern visualization APIs to their
      limits to achieve interactive visualization of exa-scale time series data sets.
  teaser_caption: >
    The NASA Exajet serves as the motivating use case for our study. The large computational fluid dynamics data set was computed
      using an adaptive mesh refinement (AMR) code and consists of 656 million cells and 423 time steps. Each time step stores 2.5 GB of data per
      scalar field. At four scalar fields for density and X/Y/Z velocity components, the full time series occupies over 4 TB. Data sets such as these
      pose significant challenges for interactive visualization on current GPU workstations. We present and evaluate a prototypical framework
      targeting GPU workstations that asynchronously streams and renders such data sets at interactive rates and with high quality.
  extra_links:
  - title: Supplemental Video
    image: /img/youtube.svg
    link: https://youtu.be/b7pgenL4hNo

---
