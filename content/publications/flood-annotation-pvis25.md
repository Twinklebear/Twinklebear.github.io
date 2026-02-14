---
title: Enabling Fast and Accurate Crowdsourced Annotation for Elevation-Aware Flood Extent Mapping
layout: publication
date: 2025-01-26
params:
  authors: Landon Dyken, Saugat Adhikari, Pravin Poudel, Steve Petruzza, Da Yan, Will Usher, Sidharth Kumar
  venue: IEEE Pacific Visualization Conference
  doi: "10.1109/PacificVis64226.2025.00025"
  paper_pdf: https://drive.google.com/file/d/1b9UmVqa7Pop6HoWim6IFrlu9U_wpjKl2/view?usp=sharing
  thumb: https://cdn.willusher.io/img/flood_ann_pvis25_thumb.jpg
  teaser: https://cdn.willusher.io/img/flood_ann_pvis25_teaser.jpg
  year: 2025
  award: Honorable Mention
  short_title: flood-annotation-pvis25
  selected: true
  arxiv: "2408.05350"
  bibtex: >
    @inproceedings{dyken_flood_ann25,
      author={Dyken, Landon and Adhikari, Saugat and Poudel, Pravin and Petruzza, Steve and Yan, Da and Usher, Will and Kumar, Sidharth},
      booktitle={IEEE Pacific Visualization Conference},
      title={Enabling Fast and Accurate Crowdsourced Annotation for Elevation-Aware Flood Extent Mapping},
      year={2025},
      doi={10.1109/PacificVis64226.2025.00025},
      }
  abstract: >
    Mapping the extent of flood events is a necessary and important aspect
    of disaster management. In recent years, deep learning methods
    have evolved as an effective tool to quickly label high-resolution imagery and
    provide necessary flood extent mappings. These methods,
    though, require large amounts of annotated training data to create
    models that are accurate and robust to new flooded imagery. In this
    work, we present FloodTrace, a web-based application that enables
    effective crowdsourcing of flooded region annotation for machine
    learning applications. To create this application, we conducted extensive
    interviews with domain experts to produce a set of formal
    requirements. Our work brings topological segmentation tools to
    the web and greatly improves annotation efficiency compared to
    the state-of-the-art. The user-friendliness of our solution allows researchers
    to outsource annotations to non-experts and utilize them to
    produce training data with equal quality to fully expert-labeled data.
    We conducted a user study to confirm our application’s effectiveness
    in which 266 graduate students annotated high-resolution aerial
    imagery from Hurricane Matthew in North Carolina. Experimental
    results show the efficiency benefits of our application for untrained
    users, with median annotation time less than half the state-of-the-art
    annotation method. In addition, using our application’s aggregation
    and correction framework, flood detection models trained on
    crowdsourced annotations were able to achieve performance equal to
    models trained on fully expert-labeled annotations, while requiring
    a fraction of the expert’s time.
  teaser_caption: >
    An annotation made on a 6500 × 3000 pixel aerial image of flooding caused by Hurricane Matthew using only ten clicks of
    our topological segmentation tool. Pixels overlaid with blue have been labeled as dry and red as flooded. Note that areas labeled
    as flooded can appear green on the left, this is due to the tree canopy obscuring the flooded ground beneath. This tool guides
    annotation using the corresponding elevation data for a region, resulting in accurate labels. This can be seen by the highlighted
    areas where the tool annotated flooding around small dry features, but left them unlabeled. In our experimental user study, we show
    that this tool is more efficient than the state-of-the-art elevation-guided tool and can be used effectively by untrained participants
---

