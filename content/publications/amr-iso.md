---
layout: publication
title: CPU Isosurface Ray Tracing of Adaptive Mesh Refinement Data
date: 2019-01-01
params:
  authors: Feng Wang, Ingo Wald, Qi Wu, Will Usher and Chris R. Johnson
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/16diX7AjdcHWe9iotdQn3MUPvY35iJpdY/view?usp=sharing
  teaser: https://cdn.willusher.io/img/PqmRTuz.webp
  thumb: https://cdn.willusher.io/img/Yzxf5OT.webp
  year: 2019
  short_title: amr-iso
  doi: 10.1109/TVCG.2018.2864850
  selected: true
  bibtex: >
    @article{Wang_AMR_Iso_2019,
      author={F. Wang and I. Wald and Q. Wu and W. Usher and C. R. Johnson},
      journal={{IEEE} {Transactions} on {Visualization} and {Computer} {Graphics}},
      title={{CPU} {Isosurface} {Ray} {Tracing} of {Adaptive} {Mesh} {Refinement} {Data}},
      year={2019},
      doi={10.1109/TVCG.2018.2864850}
    }
  abstract: >
    Adaptive mesh refinement (AMR) is a key technology for large-scale simulations that allows for adaptively changing the simulation mesh resolution, resulting in significant computational and storage savings. However, visualizing such AMR data poses a significant challenge due to the difficulties introduced by the hierarchical representation when reconstructing continuous field values. In this paper, we detail a comprehensive solution for interactive isosurface rendering of block-structured AMR data. We contribute a novel reconstruction strategy&mdash;the *octant* method&mdash;which is continuous, adaptive and simple to implement. Furthermore, we present a generally applicable hybrid implicit isosurface ray-tracing method, which provides better rendering quality and performance than the built-in sampling-based approach in OSPRay. Finally, we integrate our *octant* method and hybrid isosurface geometry into OSPRay as a module, providing the ability to create high-quality interactive visualizations combining volume and isosurface representations of BS-AMR data. We evaluate the rendering performance, memory consumption and quality of our method on two gigascale block-structured AMR datasets.
  teaser_caption: >
    High-fidelity isosurface visualizations of gigascale block-structured adaptive mesh refinement (BS-AMR) data using our method. Left: a 28GB GR-Chombo simulation of gravitational waves resulting from the collision of two black holes. Middle and Right: a 57GB AMR dataset computed with LAVA at NASA, simulating multiple fields over the landing gear of an aircraft. Middle: isosurface representation of the vorticity, rendered with path tracing. Right: a combined visualization of volume rending and an isosurface of the pressure over the landing gear, rendered with OSPRay's SciVis renderer.  Using our approach for ray tracing such AMR data, we can interactively render crack-free implicit isosurfaces in combination with direct volume rendering and advanced shading effects like transparency, ambient occlusion and path tracing.
  extra_links:
  - title: AMR Isosurface module for OSPRay
    link: https://github.com/ethan0911/module-impi
    image: /img/github.svg

---
