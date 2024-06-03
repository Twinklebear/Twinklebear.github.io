---
layout: publication
title: Scalable Data Management of the Uintah Simulation Framework for Next-Generation Engineering Problems with Radiation
date: 2018-03-20
params:
  authors: >
    Sidharth Kumar, Alan Humphrey, Will Usher, Steve Petruzza,
    Brad Peterson, John A. Schmidt, Derek Harris, Ben Isaac,
    Jeremy Thornock, Todd Harman, Valerio Pascucci, and Martin Berzins
  venue: Supercomputing Frontiers
  paper_pdf: https://drive.google.com/file/d/17-Nf3HXQM_meYvB4t8K5Wi_fOCx6B_W6/view?usp=sharing
  thumb: https://cdn.willusher.io/img/w5YWvd6.webp
  year: 2018
  short_title: scasia18
  doi: 10.1007/978-3-319-69953-0_13
  bibtex: >
    @incollection{kumar_scalable_2018,
      title = {Scalable {Data} {Management} of the {Uintah} {Simulation}
        {Framework} for {Next}-{Generation} {Engineering} {Problems} with {Radiation}},
      volume = {10776},
      isbn = {978-3-319-69952-3 978-3-319-69953-0},
      booktitle = {Supercomputing {Frontiers}},
      publisher = {Springer International Publishing},
      author = {Kumar, Sidharth and Humphrey, Alan and Usher, Will and Petruzza, Steve 
        and Peterson, Brad and Schmidt, John A. and Harris, Derek and Isaac, Ben
        and Thornock, Jeremy and Harman, Todd and Pascucci, Valerio and Berzins, Martin},
      editor = {Yokota, Rio and Wu, Weigang},
      year = {2018},
      doi = {10.1007/978-3-319-69953-0_13},
      pages = {219--240}
    }
  abstract: >
    The need to scale next-generation industrial engineering
    problems to the largest computational platforms presents unique challenges.
    This paper focuses on data management related problems faced
    by the Uintah simulation framework at a production scale of 260K processes.
    Uintah provides a highly scalable asynchronous many-task runtime
    system, which in this work is used for the modeling of a 1000
    megawatt electric (MWe) ultra-supercritical (USC) coal boiler. At 260K
    processes, we faced both parallel I/O and visualization related challenges,
    e.g., the default file-per-process I/O approach of Uintah did not scale
    on Mira. In this paper we present a simple to implement, restructuring
    based parallel I/O technique. We impose a restructuring step that
    alters the distribution of data among processes. The goal is to distribute
    the dataset such that each process holds a larger chunk of data, which is
    then written to a file independently. This approach finds a middle ground
    between two of the most common parallel I/O schemes–file per process
    I/O and shared file I/O–in terms of both the total number of generated
    files, and the extent of communication involved during the data aggregation
    phase. To address scalability issues when visualizing the simulation
    data, we developed a lightweight renderer using OSPRay, which allows
    scientists to visualize the data interactively at high quality and make
    production movies. Finally, this work presents a highly efficient and scalable
    radiation model based on the sweeping method, which significantly
    outperforms previous approaches in Uintah, like discrete ordinates. The
    integrated approach allowed the USC boiler problem to run on 260K
    CPU cores on Mira.
  extra_links:
  - title: Uintah UASC Coal Boiler Visualization
    link: https://youtu.be/vpJtHTzArq4
    image: /img/youtube.svg

---
