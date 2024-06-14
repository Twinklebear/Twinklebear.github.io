---
layout: publication
title: Efficient Space Skipping and Adaptive Sampling of Unstructured Volumes Using Hardware Accelerated Ray Tracing
date: 2019-10-20
params:
  authors: Nate Morrical, Will Usher, Ingo Wald and Valerio Pascucci
  venue: IEEE VIS Short Papers
  paper_pdf: https://drive.google.com/file/d/17QbRAeUvdPpniwSTgExX3RulPoejvQJ6/view?usp=sharing
  teaser: https://cdn.willusher.io/img/NgoH3iw.webp
  thumb: https://cdn.willusher.io/img/deoKQwV.webp
  year: 2019
  short_title: rtx-space-skipping
  doi: 10.1109/VISUAL.2019.8933539
  arxiv: 1908.01906 
  selected: true
  bibtex: >
    @inproceedings{morrical_skipping_2019,
      title = {Efficient {Space} {Skipping} and {Adaptive} {Sampling} of {Unstructured}
          {Volumes} {Using} {Hardware} {Accelerated} {Ray} {Tracing}},
      booktitle = {IEEE VIS 2019 - Short Papers},
      author = {Morrical, Nate, and Usher, Will and Wald, Ingo, and Pascucci, Valerio},
      doi={10.1109/VISUAL.2019.8933539},
      year = {2019}
    }
  abstract: >
    Sample based ray marching is an effective method for direct volume
      rendering of unstructured meshes. However, sampling such meshes remains expensive,
      and strategies to reduce the number of samples taken have received relatively
      little attention. In this paper, we introduce a method for rendering unstructured 
      meshes using a combination of a coarse spatial acceleration structure and 
      hardware-accelerated ray tracing. Our approach enables efficient empty space
      skipping and adaptive sampling of unstructured meshes, and outperforms a reference
      ray marcher by up to 7×.
  teaser_caption: >
    Performance improvement of our method on the 278 million
      tetrahedra Japan Earthquake data set. (a) A reference volume ray marcher
      without our method, at 0.9 FPS (1024^2 pixels) on an NVIDIA RTX 8000 GPU.
      (b) A heat map of relative cost per-pixel in (a).
      (c) and (d), the same, but now with our space skipping and adaptive sampling method,
      running at 7 FPS (7× faster).
  extra_links:
  - title: Presentation
    link: https://youtu.be/205EtIX3H6k
    image: /img/youtube.svg

---
