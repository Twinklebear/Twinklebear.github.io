---
layout: publication
title: In Situ Exploration of Particle Simulations with CPU Ray Tracing
date: 2016-10-01
params:
  authors: Will Usher, Ingo Wald, Aaron Knoll, Michael E. Papka, and Valerio Pascucci
  venue: Supercomputing Frontiers and Innovations
  paper_pdf: https://drive.google.com/file/d/17v8beJRxpT0wUnGxWlLkxbEwF7WGbjgR/view?usp=sharing
  teaser: https://cdn.willusher.io/img/DO3JqOb.webp
  thumb: https://cdn.willusher.io/img/gieTAy3.webp
  short_title: isp-jsfi
  doi: 10.14529/jsfi160401
  year: 2016
  bibtex: >
    @article{Usher_InSituParticles_2016,
      author={Will Usher and Ingo Wald and Aaron Knoll and Michael E. Papka and Valerio Pascucci},
      title={In {Situ} {Exploration} of {Particle} {Simulations} with {CPU} {Ray} {Tracing}},
      journal={{Supercomputing} {Frontiers} and {Innovations}},
      volume={3},
      number={4},
      year={2016},
      issn={2313-8734},
      doi={10.14529/jsfi160401}
    }
  abstract: >
    We present a system for interactive in situ visualization of large particle simulations, suitable for general CPU-based HPC architectures. As simulations grow in scale, in situ methods are needed to alleviate IO bottlenecks and visualize data at full spatio-temporal resolution. We use a lightweight loosely-coupled layer serving distributed data from the simulation to a data-parallel renderer running in separate processes. Leveraging the OSPRay ray tracing framework for visualization and balanced P-k-d trees, we can render simulation data in real-time, as they arrive, with negligible memory overhead. This flexible solution allows users to perform exploratory in situ visualization on the same computational resources as the simulation code, on dedicated visualization clusters or remote workstations, via a standalone rendering client that can be connected or disconnected as needed. We evaluate this system on simulations with up to 227M particles in the LAMMPS and Uintah computational frameworks, and show that our approach provides many of the advantages of tightly-coupled systems, with the flexibility to render on a wide variety of remote and co-processing resources.
  teaser_caption: >
    A coal particle combustion simulation in Uintah at three different timesteps with (left to right): 34.61M, 48.46M and 55.39M particles, with attribute based culling showing the full jet (top) and the front in detail (bottom). Using our in situ library to query and send data to our rendering client in OSPRay these images are rendered interactively with ambient occlusion, averaging around 13 FPS at 1920×1080. The renderer is run on 12 nodes of the Stampede supercomputer and pulls data from a Uintah simulation running on 64 processes (4 nodes). Our loosely-coupled in situ approach allows for live exploration at the full temporal fidelity of the simulation, without prohibitive IO cost.
  extra_links:
  - title: In Situ Particles module for OSPRay
    link: https://github.com/Twinklebear/in-situ-particles
    image: /img/github.svg

---
