---
layout: publication
title: Progressive CPU Volume Rendering with Sample Accumulation
date: 2017-06-12
params:
  authors: Will Usher, Jefferson Amstutz, Carson Brownlee, Aaron Knoll, and Ingo Wald
  venue: Eurographics Symposium on Parallel Graphics and Visualization
  paper_pdf: https://drive.google.com/file/d/1810fZFNQYl4fXsiPkNFq5PuPZT0OKGNU/view?usp=sharing
  teaser: https://cdn.willusher.io/img/15y1f8I.webp
  thumb: https://cdn.willusher.io/img/tdxjYs3.webp
  short_title: savr
  doi: 10.2312/pgv.20171090
  year: 2017
  bibtex: >
    @inproceedings{Usher_SAVR_2017,
      booktitle={Eurographics Symposium on Parallel Graphics and Visualization},
      editor={Alexandru Telea and Janine Bennett},
      title={{Progressive CPU Volume Rendering with Sample Accumulation}},
      author={Usher, Will and Amstutz, Jefferson and Brownlee, Carson and Knoll, Aaron and Wald, Ingo},
      year={2017},
      publisher={The Eurographics Association},
      issn={1727-348X},
      isbn={978-3-03868-034-5},
      doi={10.2312/pgv.20171090}
    }
  abstract: >
    We present a new method for progressive volume rendering by accumulating object-space samples over successively rendered frames. Existing methods for progressive refinement either use image space methods or average pixels over frames, which can blur features or integrate incorrectly with respect to depth. Our approach stores samples along each ray, accumulates new samples each frame into a buffer, and progressively interleaves and integrates these samples. Though this process requires additional memory, it ensures interactivity and is well suited for CPU architectures with large memory and cache. This approach also extends well to distributed rendering in cluster environments. We implement this technique in Intel’s open source OSPRay CPU ray tracing framework and demonstrate that it is particularly useful for rendering volumetric data with costly sampling functions.
  teaser_caption: >
    (a-c) Progressive refinement with Sample-Accumulation Volume Rendering (SAVR) on the 40GB Landing Gear AMR dataset using a prototype AMR sampler. The SAVR algorithm correctly accumulates frames to progressively refine the image. After 16 frames of accumulation the volume is sampled at the Nyquist limit, with some small noise, by 32 frames the noise has been removed. SAVR extends to distributed data, in (d) we show the 1TB DNS dataset, a 10240×7680×1536 uniform grid, rendered interactively across 64 second-generation Intel Xeon Phi "Knights Landing" (KNL) processor nodes on Stampede 1.5 at a 6144×1024 resolution. While interacting, our method achieves around 5.73 FPS.
  extra_links:

---
