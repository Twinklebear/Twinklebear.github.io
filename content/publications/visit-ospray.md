---
layout: publication
title: "VisIt-OSPRay: Toward an Exascale Volume Visualization System"
date: 2018-06-04
params:
  authors: >
    Qi Wu, Will Usher, Steve Petruzza, Sidharth Kumar, Feng Wang,
    Ingo Wald, Valerio Pascucci, and Charles D. Hansen
  venue: Eurographics Symposium on Parallel Graphics and Visualization
  paper_pdf: https://drive.google.com/file/d/17Nu9EnI-9PLdWN6QGfVDvdqfNc2h063W/view?usp=sharing
  teaser: https://cdn.willusher.io/img/JgAOmst.webp
  thumb: https://cdn.willusher.io/img/RxCFTxo.webp
  year: 2018
  short_title: visit-ospray
  doi: 10.2312/pgv.20181091
  bibtex: >
    @inproceedings{Wu_VisItOSPRay_2018,
      booktitle = {Eurographics Symposium on Parallel Graphics and Visualization},
      editor = {Hank Childs and Fernando Cucchietti},
      title = {{VisIt}-{OSPRay}: {Toward} an {Exascale} {Volume} {Visualization} {System}},
      author = {Wu, Qi and Usher, Will and Petruzza, Steve and Kumar, Sidharth and Wang,
        Feng and Wald, Ingo and Pascucci, Valerio and Hansen, Charles D.},
      year = {2018},
      publisher = {The Eurographics Association},
      ISSN = {1727-348X},
      ISBN = {978-3-03868-054-3},
      DOI = {10.2312/pgv.20181091}
    }
  "abstract": >
    Large-scale simulations can easily produce data in excess of what can be efficiently visualized using production visualization software, making it challenging for scientists to gain insights from the results of these simulations. This trend is expected to grow with exascale. To meet this challenge, and run on the highly parallel hardware being deployed on HPC system, rendering systems in production visualization software must be redesigned to perform well at these new scales and levels of parallelism. In this work, we present VisIt-OSPRay, a high-performance, scalable, hybrid-parallel rendering system in VisIt, using OSPRay and IceT, coupled with PIDX for scalable I/O. We examine the scalability and memory efficiency of this system and investigate further areas for improvement to prepare VisIt for upcoming exascale workloads.
  teaser_caption: >
    High-quality interactive volume visualization using VisIt-OSPRay: **a)*** volume rendering of O^2 concentration
    inside a combustion chamber, data courtesy of the [University of Utah CCMSC](http://ccmsc.sci.utah.edu/); **b)***
    volume rendering of the Richtmyer-Meshkov Instability; **c)** visualization of a supernova simulation;
    **d)** visualization of the aneurysm dataset using volume rendering and streamlines;
    **e)** scalable volume rendering of the 966GB DNS data on 64 Stampede2 Intel Xeon Phi Knight's Landing nodes.

---
