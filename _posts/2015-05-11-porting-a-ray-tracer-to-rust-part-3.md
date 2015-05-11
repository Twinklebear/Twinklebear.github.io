---
published: false
layout: post
title: "Porting a Ray Tracer to Rust, part 3"
description: "Path Tracing and Meshes"
category: 
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

It's been a little while since my last post on tray\_rust as I've been a bit busy with classes, but I've
had a bit of free time to implement some extremely cool features. In this post we'll look at porting over
the path tracing code, adding a bounding volume hierarchy, triangle meshes and support for measured material data from the
[MERL BRDF Database](http://www.merl.com/brdf/) [MPBM03].

Path Tracing
---
**TODO**: Not a ton to say here, path tracing isn't super complicated. Maybe give a high level overview of the method
and then some detail on tray\_rust's implementation.

Bounding Volume Hierarchy
---
**TODO:** The BVH is interesting in that it takes advantage of traits very nicely. Mention the annoyance with bounds on
user defined traits. Mention the Fn being inlined. Link to the [Abstraction without overhead](http://blog.rust-lang.org/2015/05/11/traits.html) post.

Triangle Meshes
---
**TODO:** Triangle meshes are neat. Cite sources for Rust logo, Buddha and Dragon. Mention tobj and the
process of publishing a crate on Cargo. Mention @huonw's awesome travis-ci script. Talk about
testing and benching in Rust.

Measured Material Data
---
**TODO:** Not a ton to say here as well, mention process of reading binary data via buffered reader
and the byteorder crate. Comes back to Rust's super cool extension trait functionality.

Final Thoughts
---
**TODO**: Place some concluding comments then have this final closer:

If you have comments, suggestions for improvements or just want to say "hi" feel free to comment below, [tweet at me](https://twitter.com/_wusher)
or ping me on IRC (I'm Twinklebear on freenode and moznet).
The code for the Rust ray tracer is MIT licensed and available on [Github](https://github.com/Twinklebear/tray_rust).

#### References
<p>
[MPBM03] <span style="font-variant:small-caps">Wojciech Matusik, Hanspeter Pfister, Matt Brand and Leonard McMillan</span>:
A Data-Driven Reflectance Model. In <i>ACM Transactions on Graphics 2003</i>.
</p>

