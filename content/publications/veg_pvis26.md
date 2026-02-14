---
title: "Volume Encoding Gaussians: Transfer Function-Agnostic 3D Gaussians for Volume Rendering"
layout: publication
date: 2026-02-14
params:
  authors: Landon Dyken, Andres Sewell, Will Usher, Nathan Debardeleben, Steve Petruzza, Sidharth Kumar
  venue: IEEE Pacific Visualization Conference (To Appear)
  paper_pdf: https://drive.google.com/file/d/1AMutGC_FD6psEo_4xRNExv6MkpLXjgmE/view?usp=sharing
  thumb: https://cdn.willusher.io/img/veg-pvis26-thumb.jpg
  teaser: https://cdn.willusher.io/img/veg-pvis26-teaser.jpg
  year: 2026
  short_title: veg-pvis26
  selected: true
  arxiv: "2504.13339"
  bibtex: >
    @inproceedings{dyken_veg26,
      author={Dyken, Landon and Sewell, Andres and Usher, Will and Debardeleben, Nathan and Petruzza, Steve and Kumar, Sidharth},
      booktitle={IEEE Pacific Visualization Conference (To Appear)},
      title={Volume Encoding Gaussians: Transfer Function-Agnostic 3D Gaussians for Volume Rendering},
      year={2026},
      }
  abstract: >
    Visualizing the large-scale datasets output by HPC resources presents a difficult challenge, as the memory and compute
    power required become prohibitively expensive for end user systems. Novel view synthesis techniques can address this by producing
    a small, interactive model of the data, requiring only a set of training images to learn from. While these models allow accessible
    visualization of large data and complex scenes, they do not provide the interactions needed for scientific volumes, as they do not
    support interactive selection of transfer functions and lighting parameters. To address this, we introduce Volume Encoding Gaussians
    (VEG), a 3D Gaussian-based representation for volume visualization that supports arbitrary color and opacity mappings. Unlike prior
    3D Gaussian Splatting (3DGS) methods that store color and opacity for each Gaussian, VEG decouple the visual appearance from
    the data representation by encoding only scalar values, enabling transfer function-agnostic rendering of 3DGS models. To ensure
    complete scalar field coverage, we introduce an opacity-guided training strategy, using differentiable rendering with multiple transfer
    functions to optimize our data representation. This allows VEG to preserve fine features across a dataset's full scalar range while
    remaining independent of any specific transfer function. Across a diverse set of volume datasets, we demonstrate that our method
    outperforms the state-of-the-art on transfer functions unseen during training, while requiring a fraction of the memory and training time.
  teaser_caption: >
    Qualitative showcase of novel view synthesis for a VEG model on complex unseen transfer functions. We train a model for the Paraview head
    dataset using the five transfer functions on the left, and test with those and the four functions on the right (A-D), where the opacity and color maps
    were unseen during training. The top, middle, and bottom rows of images show ground truth, inference, and difference images.
---

