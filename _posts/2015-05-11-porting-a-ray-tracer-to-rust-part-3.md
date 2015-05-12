---
published: false
layout: post
title: "Porting a Ray Tracer to Rust, part 3"
description: "Path Tracing and Meshes"
category: 
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

It's been a little while since my last post on tray\_rust as I've been a busy with classes, but I've
had a bit of free time to implement some extremely cool features. In this post we'll look at porting over
the path tracing code, adding a bounding volume hierarchy, triangle meshes and support for measured material data from the
[MERL BRDF Database](http://www.merl.com/brdf/) [MPBM03]. In the process of implementing the BVH we'll get a taste
of Rust's generic programming facilities and use them to write a flexible BVH capable of storing any type that can
report its bounds. In the spirit of fogleman's gorgeous [Go Gopher in Go](https://github.com/fogleman/pt) we'll wrap up
by rendering the Rust logo in Rust using a model made by
[Nylithius on BlenderArtists](http://blenderartists.org/forum/showthread.php?362836-Rust-language-3D-logo).

If you've been following Rust's development a bit you'll probably also have noticed that the timing of this post is not a
coincidence as Rust 1.0.0 is being released [Friday, May 15](http://blog.rust-lang.org/2015/02/13/Final-1.0-timeline.html)!

<!--more-->

Path Tracing
---
**TODO**: Review this section

[Path tracing](http://en.wikipedia.org/wiki/Path_tracing), introduced by Kajiya in 1986, is a standard and surprisingly simple method for computing photo-realistic
images in computer graphics. This simplicity and quality does come at a cost and path traced images typically require thousands of samples
per pixel to compute a noise-free image (some more on this shortly). While I won't try and fully explain path tracing since I won't be able to cover
it as well as other resources around, a short overview of what we're doing is helpful.

The concept underlying path tracing is pretty straightforward: if we think about a point on a surface in some scene the light we see at this point is the result
of all light incident on the point from other surfaces and lights modulated by the surface reflectance properties, along with any light emitted by the surface
itself at that point. Considering a point on a plane this gives us an integral over a hemisphere centered at the point. Note that this doesn't constrain us
to hemispheres, eg. a point on some edge would just integrate over a larger spherical region. This idea gives us the
[rendering equation](http://en.wikipedia.org/wiki/Rendering_equation) and solving this equation will give use the illumination at every point in the scene.

The equation on Wikipedia is a bit more than we'll be needing here as we'll only be rendering static scenes and won't consider wavelength dependent effects,
allowing us to ignore \\(t\\) and \\(\lambda\\). This lets us write down an easier to parse version of the equation:

\\[
L_o(x, w_o) = L_e(x, w_o) + \int_{\Omega} f(x, w_i, w_o) L_i(x, w_i) w_i \cdot n \text{d}w_i
\\]

Here \\(L_o(x, w_o)\\) is the computed outgoing radiance along direction \\(w_o\\) leaving \\(x\\), \\(L_e\\) is the equivalent for light emitted at the point
and \\(L_i(x, w_i)\\) is the incident light coming from direction \\(w_i\\) arring at the point. \\(f(x, w_i, w_o)\\) is the surface's
[Bidirectional reflectance distribution function (BRDF)](http://en.wikipedia.org/wiki/Bidirectional_reflectance_distribution_function) which describes
how arriving at the point along direction \\(w_i\\) is reflected back along \\(w_o\\). The BRDF is used to refer to opaque surfaces and in general
the [Bidirectional scattering distribution function (BSDF)](http://en.wikipedia.org/wiki/Bidirectional_scattering_distribution_function) applies, eg. to
transparent objects or subsurface scattering effects and so on. The final \\(w_i \cdot n\\) term is the geometry term and weakens light that arrives at
glancing angles. This is of course a very shortened look at the rendering equation, for an excellent explanation I highly recommend reading
[Physically Based Rendering](http://pbrt.org/). If you'd like more detail but don't want to buy a whole book on rendering
[Realistic Raytracing - Zack Waters](http://web.cs.wpi.edu/~emmanuel/courses/cs563/write_ups/zackw/realistic_raytracing.html) and
[Global Illumination in a Nutshell](http://www.thepolygoners.com/tutorials/GIIntro/GIIntro.htm) linked in fogleman's readme look to be good as well.

While it's possible to solve the rendering equation analytically for some simple scenes our situation is pretty hopeless for most scenes and
to compute the integral in general we turn to randomness in the form of [Monte Carlo integration](http://en.wikipedia.org/wiki/Monte_Carlo_method). Solving
the rendering equation with path tracing amounts to tracing millions of rays, taking thousands of samples per pixel to sufficiently sample the integral.
Starting with an eye ray we find the first surface it hit, sample a light source (if there's many we just pick one randomly) for direct lighting, then
pick a random direction on the hemisphere to shoot another ray, find what it hits and repeat. We'll then terminate the ray
at some number of bounces since after a certain point there's very little illumination coming back along the ray to the first point we hit.
The [pseudo-code](http://en.wikipedia.org/wiki/Path_tracing#Algorithm) on Wikipedia gives a decent overview of the algorithm.

Although we're now able to render any scene Path tracing our usage of Monte Carlo integration requires that we must take huge numbers of samples
to accurately compute the integral. The effect of sampling rate on quality is shown below, with very few samples per pixel the result is quite poor and
noisy but as we take more and more it converges to a high quality image. Taking more samples per pixel also comes with an increased rendering cost,
as you'd would expect. The image with 2 samples per pixel takes a mere 90ms to render while with 2048 samples it takes 94.203s at to render the
200x200 pixel image.

<div class="col-lg-12 col-md-12 col-xs-12">
<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/sPGEQhO.png"><img class="img-responsive" src="http://i.imgur.com/sPGEQhO.png"></a>
<p>2 samples</p>
</div>

<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/rF0SWIY.png"><img class="img-responsive" src="http://i.imgur.com/rF0SWIY.png"></a>
<p>8 samples</p>
</div>

<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/Tbbuzhs.png"><img class="img-responsive" src="http://i.imgur.com/Tbbuzhs.png"></a>
<p>32 samples</p>
</div>

<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/eJJ290s.png"><img class="img-responsive" src="http://i.imgur.com/eJJ290s.png"></a>
<p>128 samples</p>
</div>

<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/mUZOd0L.png"><img class="img-responsive" src="http://i.imgur.com/mUZOd0L.png"></a>
<p>512 samples</p>
</div>

<div class="col-lg-2 col-md-2 col-xs-2" style="text-align:center">
<a href="http://i.imgur.com/rYA2keF.png"><img class="img-responsive" src="http://i.imgur.com/rYA2keF.png"></a>
<p>2048 samples</p>
</div>
</div>

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

<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

