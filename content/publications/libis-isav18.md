---
layout: publication
title: "libIS: A Lightweight Library for Flexible In Transit Visualization"
date: 2018-11-12
params:
  authors: >
    Will Usher, Silvio Rizzi, Ingo Wald, Jefferson Amstutz,
    Joseph Insley, Venkatram Vishwanath, Nicola Ferrier,
    Michael E. Papka, and Valerio Pascucci
  venue: >
    ISAV: In Situ Infrastructures for Enabling Extreme-Scale Analysis and Visualization (ISAV '18)
  paper_pdf: https://drive.google.com/file/d/16n-s5TOd8Qt9Iy3yh25ha2fmZdoMlKVr/view?usp=sharing
  teaser: https://cdn.willusher.io/img/UYlTqhT.webp
  thumb: https://cdn.willusher.io/img/aCX8XH2.webp
  year: 2018
  short_title: libis-isav18
  doi: 10.1145/3281464.3281466
  bibtex: >
    @inproceedings{usher_libis_2018,
      title = {{libIS}: {A} {Lightweight} {Library} for
          {Flexible} {In} {Transit} {Visualization}},
      year = {2018},
      booktitle = {ISAV: In Situ Infrastructures for Enabling
          Extreme-Scale Analysis and Visualization},
      series = {ISAV'18},
      author = {Usher, Will and Rizzi, Silvio and Wald, Ingo
          and Amstutz, Jefferson and Insley, Joseph and
          Vishwanath, Venkatram and Ferrier, Nicola and
          Papka, Michael E. and Pascucci, Valerio},
      doi={10.1145/3281464.3281466}
    }
  teaser_caption: >
    Interactive in situ visualization of a 172k atom simulation of silicene formation with 128 LAMMPS ranks sending
    to 16 OSPRay renderer ranks, all executed on Theta in the mpi-multi configuration. When taking four
    ambient occlusion samples per-pixel, our viewer averages 7FPS at 1024x1024. Simulation dataset is
    courtesy of [Cherukara et al.](https://pubs.rsc.org/en/content/articlelanding/2017/nr/c7nr03153j).
  abstract: >
    As simulations grow in scale, the need for in situ analysis methods to handle the large data produced grows correspondingly. One desirable approach to in situ visualization is in transit visualization. By decoupling the simulation and visualization code, in transit approaches alleviate common difficulties with regard to the scalability of the analysis, ease of integration, usability, and impact on the simulation. We present libIS, a lightweight, flexible library which lowers the bar for using in transit visualization. Our library works on the concept of abstract regions of space containing data, which are transferred from the simulation to the visualization clients upon request, using a client-server model. We also provide a SENSEI analysis adaptor, which allows for transparent deployment of in transit visualization. We demonstrate the flexibility of our approach on batch analysis and interactive visualization use cases on different HPC resources.
  extra_links:
  - title: Supplemental Video
    link: https://youtu.be/YUH55CvPmxg
    image: /img/youtube.svg
  - title: libIS
    link: https://github.com/Twinklebear/libIS
    image: /img/github.svg
  - title: SENSEI Adaptor for libIS and LAMMPS
    link: https://gitlab.kitware.com/sensei/sensei/tree/lammps/miniapps/lammps
    image: /img/github.svg
  - title: Theta SSH Tunneling Script
    link: https://github.com/Twinklebear/theta-tunnel
    image: /img/github.svg

---
