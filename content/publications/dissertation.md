---
layout: publication
title: Adaptive Multiresolution Techniques for I/O, Data Layout, and Visualization of Massive Simulations
date: 2021-03-17
params:
  authors: Will Usher
  venue: PhD Dissertation, University of Utah
  paper_pdf: https://drive.google.com/file/d/17LOEzGL53LxYCY5ROvnD9Us_Dr3yvRzl/view?usp=sharing
  teaser: /img/dissertation_contributions_in_pipeline.svg
  year: 2021
  short_title: dissertation
  selected: true
  bibtex: >
    @thesis{usher_dissertation_2021,
      title = {{Adaptive} {Multiresolution} {Techniques} for {I}/{O}, {Data} {Layout}, and {Visualization} of {Massive} {Simulations}},
      type = {phdthesis},
      author = {Usher, Will},
      school = {University of Utah},
      year = {2021}
    }
  abstract: >
    "The continuing growth in computational power available on high-performance
      computing systems has allowed for increasingly higher fidelity simulations. As
      these simulations grow in scale, the amount of data produced grows
      correspondingly, challenging existing strategies for I/O and
      visualization. Moreover, although prior work has sought to achieve high
      bandwidth I/O at scale or post hoc visualization of massive data sets, treating
      these two sides of the simulation visualization pipeline independently introduces a
      bottleneck between them, where data must be converted from the simulation
      output layout to the layout used for visualization.

      The aim of this dissertation is to address key challenges across the simulation
      visualization pipeline to provide efficient end-to-end support for massive data
      sets. First, this dissertation proposes an I/O approach for particle data that
      rebalances the I/O workload on nonuniform distributions by constructing a
      spatial data structure, improving I/O performance and portability.
      To eliminate data layout bottlenecks between I/O and
      visualization, this dissertation proposes a layout for particle data that
      balances rendering and attribute-query access patterns through a
      spatial *k*-d tree and fixed size bitmap indices. The layout is constructed
      quickly when writing the data and requires little additional memory to store.
      This dissertation proposes a number of approaches to enable visualization of
      massive data sets at different scales. An asynchronous tile-based processing
      pipeline is proposed for distributed full-resolution rendering that overlaps
      compositing and rendering tasks to improve performance. Next, a virtual reality
      tool for neuron tracing in large connectomics data is proposed. The VR tool
      employs an intuitive painting metaphor and a real-time page-based data
      processing system to visualize large data without discomfort. To visualize
      massive data in compute and memory constrained environments, a GPU parallel
      isosurface extraction algorithm is proposed for block-compressed data sets. The
      algorithm is built on a GPU-driven memory management and caching strategy that
      allows working with compressed data sets entirely on the GPU. Finally, a
      simulation-oblivious approach to data transfer for loosely coupled in situ
      visualization is proposed that minimizes the impact of the visualization by
      offloading data restructuring from the simulation."
  teaser_caption: >
    An illustration of how this dissertation's contributions fit together
      in the broader scope of the end-to-end simulation visualization pipeline.
      The contributions discussed work together to support massive data sets
      across the simulation visualization pipeline

---

