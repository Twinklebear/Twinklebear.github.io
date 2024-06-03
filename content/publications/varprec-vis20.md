---
layout: publication
title: Efficient and Flexible Hierarchical Data Layouts for a Unified Encoding of Scalar Field Precision and Resolution
date: 2021-01-01
params:
  authors: Duong Hoang, Brian Summa, Harsh Bhatia, Peter Lindstrom, Pavol Klacansky, Will Usher, Peer-Timo Bremer and Valerio Pascucci
  venue: IEEE Transactions on Visualization and Computer Graphics
  paper_pdf: https://drive.google.com/file/d/17EajPleIGKPmTb04hpZ8qgQhByaXYG8B/view?usp=sharing
  teaser: https://cdn.willusher.io/img/UICjif7.webp
  thumb: https://cdn.willusher.io/img/jzIIRBX.webp
  year: 2021
  short_title: varprec-vis20
  doi: 10.1109/TVCG.2020.3030381
  bibtex: >
    @article{hoang_efficient_2021,
      author={Hoang, Duong and Summa, Brian and Bhatia, Harsh and Lindstrom, Peter and
          Klacansky, Pavol and Usher, Will and Bremer, Peer-Timo and Pascucci, Valerio},
      journal={{IEEE} {Transactions} on {Visualization} and {Computer} {Graphics}},
      title={{Efficient} and {Flexible} {Hierarchical} {Data} {Layouts} for a
          {Unified} {Encoding} of {Scalar} {Field} {Precision} and {Resolution}},
      doi={10.1109/TVCG.2020.3030381},
      year={2021}
    }
  abstract: >
    To address the problem of ever-growing scientific data sizes making data movement
      a major hindrance to analysis, we introduce a novel encoding for scalar fields: a unified tree
      of resolution and precision, specifically constructed so that valid cuts correspond to sensible
      approximations of the original field in the precision-resolution space. Furthermore, we introduce
      a highly flexible encoding of such trees that forms a parameterized family of data hierarchies.
      We discuss how different parameter choices lead to different trade-offs in practice, and show
      how specific choices result in known data representation schemes such as ZFP, IDX, and JPEG2000.
      Finally, we provide system-level details and empirical evidence on how such hierarchies
      facilitate common approximate queries with minimal data movement and time, using real-world data
      sets ranging from a few gigabytes to nearlya terabyte in size. Experiments suggest that our new
      strategy of combining reductions in resolution and precision is competitive with state-of-the-art
      compression techniques with respect to data quality, while being significantly more flexible and
      orders of magnitude faster, and requiring significantly reduced resources.
  teaser_caption: >
    We propose a hierarchical data layout that allows for various forms of progressive
      decoding that modulate improvements in both precision and resolution. Each progressive decoding
      traces a monotonic nondecreasing curve in the precision-resolution space from the origin, 0%,
      to the full data, 100% (shown in (a)). Using a 900 GB turbulent channel flow field (10240×7680×1536, float64)
      (b), we demonstrate three approximations (c,d,e) of progressively increasing quality decoded along the
      curve in (a). The time to decode the data and RAM used are shown in the figure; data retrieved
      values are inclusive of the preceding points along the curve
  extra_links:
  - title: Presentation
    link: https://youtu.be/gSQglICXNd0?start=5950
    image: /img/youtube.svg

---
