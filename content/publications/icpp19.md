---
layout: publication
title: Spatially-aware Parallel I/O for Particle Data
date: 2019-08-05
params:
  authors: Sidharth Kumar, Steve Petruzza, Will Usher, and Valerio Pascucci
  venue: 48th International Conference on Parallel Processing (ICPP)
  paper_pdf: https://drive.google.com/file/d/16sCt8sOgJGr03DPJHmBHOo1qjFP5-VPU/view?usp=sharing
  teaser: /img/icpp-two-phase-io.svg
  thumb: https://cdn.willusher.io/img/GWCom0N.webp
  year: 2019
  short_title: icpp19
  doi: 10.1145/3337821.3337875
  bibtex: >
    @inproceedings{kumar_spatially-aware_2019,
      title = {{Spatially}-aware {Parallel} {I}/{O} for {Particle} {Data}},
      booktitle = {Proceedings of the 48th International Conference on Parallel Processing},
      series = {ICPP 2019},
      author = {Kumar, Sidharth and Petruzza, Steve and Usher, Will and Pascucci, Valerio},
      year = {2019},
      doi = {10.1145/3337821.3337875}
    }
  abstract: >
    Particle data are used across a diverse set of large scale simulations,
      for example, in cosmology, molecular dynamics and combustion. 
      At scale these applications generate tremendous amounts of data, which is
      often saved in an unstructured format that does not preserve spatial locality;
      resulting in poor read performance for post-processing analysis and visualization tasks,
      which typically make spatial queries.
      In this work, we explore some of the challenges of large scale particle data 
      management, and introduce new techniques to perform scalable, spatially-aware write and read operations.
      We propose an adaptive aggregation technique to improve the performance of data aggregation, for
      both uniform and non-uniform particle distributions. Furthermore, we enable efficient read operations
      by employing a level of detail re-ordering and a multi-resolution layout. Finally, we demonstrate the
      scalability of our techniques with experiments
      on large scale simulation workloads up to 256K cores on two different leadership supercomputers, Mira and Theta.
  teaser_caption: An illustration of our two-phase I/O approach, which takes spatial locality into consideration.

---
