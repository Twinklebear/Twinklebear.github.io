---
layout: publication
title: Using Hardware Ray Transforms to Accelerate Ray/Primitive Intersections for Long, Thin Primitive Types
date: 2020-07-05
params:
  authors: Ingo Wald, Nate Morrical, Stefan Zellmann, Lei Ma, Will Usher, Tiejun Huang, Valerio Pascucci
  venue: Proceedings of the ACM on Computer Graphics and Interactive Techniques (Proceedings of High Performance Graphics)
  paper_pdf: https://drive.google.com/file/d/16ksJtzw6_mUW1e3WPZ7YWXWqAd3o_rmr/view?usp=sharing
  teaser: https://cdn.willusher.io/img/trtSPND.webp
  thumb: https://cdn.willusher.io/img/PqZhtFN.webp
  year: 2020
  short_title: owltubes
  selected: true
  doi: 10.1145/3406179
  bibtex: >
    @article{wald_owltubes_20,
      journal = {Proceedings of the ACM on Computer Graphics and Interactive Techniques (Proceedings of High Performance Graphics)},
      title = {{Using Hardware Ray Transforms to Accelerate Ray/Primitive Intersections for Long, Thin Primitive Types}},
      author = {Wald, Ingo and Morrical, Nate and Zellmann, Stefan and Ma, Lei and Usher, Will and Huang, Tiejun and Pascucci, Valerio},
      doi={10.1145/3406179},
      year = {2020}
    }
  abstract: >
    With the recent addition of hardware ray tracing capabilities, GPUs have become incredibly efficient
      at ray tracing both triangular geometry, and instances thereof. However, the bounding volume hierarchies
      that current ray tracing hardware relies on are known to struggle with long, thin primitives like cylinders and
      curves, because the axis-aligned bounding boxes that these hierarchies rely on cannot tightly bound such
      primitives. In this paper, we evaluate the use of RTX ray tracing capabilities to accelerate these primitives
      by tricking the GPU's instancing units into executing a hardware-accelerated oriented bounding box (OBB)
      rejection test before calling the user’s intersection program. We show that this can be done with minimal
      changes to the intersection programs and demonstrate speedups of up to 5.9× on a variety of data sets.
  teaser_caption: >
    Three of the models we used for evaluating our method: Left) SciVis2011 contest data set (334.96K
      rounded cylinders via Quilez-style 'capsules', plus 315.88K triangles). Middle,Right) hair/fur on the Blender
      Foundation franck and autumn models (2.4M and 3.4M 'phantom' curve segments, plus 249.62K and 904.40K
      triangles, respectively). For these three models, our method leverages hardware ray transforms to realize
      a hardware-accelerated OBB culling test, achieving speedup of 1.3×, 2.0×, and 2.1×, respectively, over a
      traditional (but also hardware-accelerated) AABB-based BVH (both methods use exactly the same primitive
      intersection codes). Bottom: heat map of number of intersection program evaluations for the two methods,
      respectively.
  extra_links:
  - title: Presentation
    link: https://youtu.be/tYP9pWT51MA
    image: /img/youtube.svg

---
