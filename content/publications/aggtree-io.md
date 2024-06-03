---
layout: publication
title: Adaptive Spatially Aware I/O for Multiresolution Particle Data Layouts
date: 2021-05-17
params:
  authors: Will Usher, Xuan Huang, Steve Petruzza, Sidharth Kumar, Stuart R. Slattery, Sam T. Reeve, Feng Wang, Chris R. Johnson, and Valerio Pascucci
  venue: IEEE International Parallel & Distributed Processing Symposium (IPDPS)
  paper_pdf: https://drive.google.com/file/d/16Qywqz3i0UhBjuI4h8oiOh27OL3kc8Ow/view?usp=sharing
  teaser: /img/ipdps-aggtree.svg
  thumb: https://cdn.willusher.io/img/nDURJI4.webp
  year: 2021
  short_title: aggtree-io
  selected: true
  doi: 10.1109/IPDPS49936.2021.00063
  bibtex: >
    @inproceedings{usher_aggtree_2021,
      booktitle = {35th IEEE International Parallel & Distributed Processing Symposium (IPDPS)},
      title = {{Adaptive} {Spatially} {Aware} {I}/{O} for {Multiresolution} {Particle} {Data} {Layouts}},
      author = {Usher, Will and Huang, Xuan and Petruzza, Steve and Kumar, Sidharth
        and Slattery, Stuart R. and Reeve, Sam T. and Wang, Feng and Johnson, Chris. R.
        and Pascucci, Valerio},
      year = {2021},
      doi={10.1109/IPDPS49936.2021.00063}
    }
  abstract: >
    Large-scale simulations on nonuniform particle distributions that evolve
      over time are widely used in cosmology, molecular dynamics, and
      engineering. Such data are often saved in an unstructured format that neither
      preserves spatial locality nor provides metadata for accelerating spatial
      or attribute subset queries, leading to poor performance of visualization
      tasks. Furthermore, the parallel I/O strategy used typically writes a
      file per process or a single shared file, neither of which is portable or
      scalable across different HPC systems.  We present a portable technique for scalable,
      spatially aware adaptive aggregation that preserves spatial locality in the
      output. We evaluate our approach on two supercomputers, Stampede2 and Summit,
      and demonstrate that it outperforms prior approaches at scale, achieving up to 2.5×
      faster writes and reads for nonuniform distributions. Furthermore, the layout written
      by our method is directly suitable for visual analytics, supporting low-latency reads
      and attribute-based filtering with little overhead.
  teaser_caption: >
    An overview of our adaptive two-phase I/O pipeline. (a) Given the number
      of particles on each rank, rank 0 constructs the Aggregation Tree to
      create leaves with similar numbers of particles. Each leaf
      is assigned to a rank responsible for aggregating the data and writing it to disk.
      (b) Each rank sends its data to its aggregator.
      (c) Each aggregator constructs our multiresolution data layout and
      writes it to disk. (d) The aggregators send the local value ranges and root node
      bitmaps for each attribute to rank 0, which populates the Aggregation
      Tree with the bitmaps and writes it out.
  extra_links:
  - title: Presentation
    link: https://youtu.be/DKNeRmauAdE
    image: /img/youtube.svg
  - title: Adaptive Spatially Aware I/O Library
    link: https://github.com/Twinklebear/libbat
    image: /img/github.svg
  - title: Benchmark scripts used to run the evaluation
    link: https://github.com/Twinklebear/libbat-benchmark-scripts
    image: /img/github.svg
  - title: ExaMPM modified to use our I/O library
    link: https://github.com/Twinklebear/ExaMPM-libbat
    image: /img/github.svg

---
