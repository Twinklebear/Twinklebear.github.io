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

Although we're able to render any scene with path tracing our usage of Monte Carlo integration requires that we must take huge numbers of samples
to accurately compute the integral. The effect of sampling rate on quality is shown below, with very few samples per pixel the result is quite poor and
noisy but as we take more and more it converges to a high quality image. Taking more samples per pixel also comes with an increased rendering cost,
as you would expect. The image with 2 samples per pixel takes a mere 90ms to render while with 2048 samples it takes 94.203s to render the
200x200 pixel image. A whopping increase in render time of three orders of magnitude! **TODO** Mention hardware these times are from.

<div class="col-lg-12 col-md-12 col-xs-12">
<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/sPGEQhO.png"><img class="img-responsive" src="http://i.imgur.com/sPGEQhO.png"></a>
<p>2 samples</p>
</div>

<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/rF0SWIY.png"><img class="img-responsive" src="http://i.imgur.com/rF0SWIY.png"></a>
<p>8 samples</p>
</div>

<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/Tbbuzhs.png"><img class="img-responsive" src="http://i.imgur.com/Tbbuzhs.png"></a>
<p>32 samples</p>
</div>

<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/eJJ290s.png"><img class="img-responsive" src="http://i.imgur.com/eJJ290s.png"></a>
<p>128 samples</p>
</div>

<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/mUZOd0L.png"><img class="img-responsive" src="http://i.imgur.com/mUZOd0L.png"></a>
<p>512 samples</p>
</div>

<div class="col-lg-4 col-md-4 col-xs-4" style="text-align:center">
<a href="http://i.imgur.com/rYA2keF.png"><img class="img-responsive" src="http://i.imgur.com/rYA2keF.png"></a>
<p>2048 samples</p>
</div>
</div>

Bounding Volume Hierarchy
---
**TODO:** The BVH is interesting in that it takes advantage of traits very nicely. Mention the annoyance with bounds on
user defined traits. Mention the Fn being inlined. Link to the 

If we wanted to render a scene with millions (or billions!) of triangles in it the process of quickly finding the first intersection
along a ray can become incredible expensive, eg. using a naive loop over the triangles would probably have us waiting weeks for our image.
To avoid this issue we use some form of spatial partitioning data structure that will let us ignore objects that the ray has no chance of hitting.
There are many possibilities for choosing a spatial data structure but the two most popular in ray tracing are
[Bounding Volume Hierarchies](http://en.wikipedia.org/wiki/Bounding_volume_hierarchy) and [k-d trees](http://en.wikipedia.org/wiki/K-d_tree).

I've chosen to implement a BVH since building a reasonably high quality one is not too costly a process and traversal is pretty straightforward. At a high
level we construct a tree of bounding axis aligned boxes that contain geometry in the scene and partition them into groups such that estimated
cost of testing the geometry in each child is as equal as possible. This method is known as the Surface Area Heurstic as we use the object's
surface area to estimate the cost of entering a node in the BVH. Traversal is then as simple as testing the bounding boxes of each child, if a child
is intersected then we traverse it recursively, although typically recursion is avoided and we manage a stack of nodes ourself.
Again I'll defer the detailed explanation to [PBRT](http://pbrt.org/) and instead we'll focus on some cool Rust features in this section
related to the implementation.

We'd like our BVH to be generic over the type it stores and require only the information needed to construct the BVH be required, that is that
the things being stored can report their bounds as an axis aligned box. As I mentioned in the
[first post of this series](http://www.willusher.io/2014/12/30/porting-a-ray-tracer-to-rust-part-1/#a-poor-design-choice) by doing this we'll be able to put both
our instances of geometry in the world and triangles in a mesh within the same BVH and re-use the code. After some helpful discussion in the comments of
that post (thanks Kevin!) I've settled on a flexible and powerful implementation that takes advantage of Rust's trait system. For some really
great discussion and background on traits in Rust take a look at [Aaron Turon's Abstraction without overhead](http://blog.rust-lang.org/2015/05/11/traits.html) post.

To provide a generic BVH that only requires types can report their world space bounds we'll need two things. First we'll need a trait to
implement on these objects (easy enough) and second we'll need a way to pass a function to be called during the BVH traversal so that
the caller can run intersection tests for example. Additionally we'd like to return whatever this function returns from our traversal
(eg. this is information about the nearest hit) and we'd like this function to be inlined as it will be called a lot in our rendering loop.
Using Rust's traits we can meet all these demands handily.

We'll start by putting together a `Boundable` trait for types that can report their bounds in space:

{% highlight rust %}
// Trait implemented by scene objects that can report an AABB describing their bounds
pub trait Boundable {
    // Get an AABB reporting the object's bounds in space
    fn bounds(&self) -> BBox;
}
{% endhighlight %}

Now we can put a constraint on the types that our BVH will accept:

{% highlight rust %}
pub struct BVH<T: Boundable> {
    geometry: Vec<T>,
    ...
}
{% endhighlight %}

Finally we can put together our intersection function for the BVH. This function will take a mutably borrowed ray and test it against
geometry in the BVH that it might intersect. After traversal has completed we'll return an option type to indicate if an intersection happened or not.
Additionally the caller's function will modify the ray's max t value (how long it is) as we find intersections with geometry during traversal.
We can require an appropriate user function by taking a generic type and constraining it to implement the [Fn](http://doc.rust-lang.org/std/ops/trait.Fn.html)
trait with the parameters and return values we expect. As en extra bonus, since we've made our intersect function generic on
the caller's function and we take it by value the compiler can even inline calls to the Fn passed, similar to C++11 lambdas.

The signature of our BVH intersect function then comes out like below. Note that the lifetime annotations are required as we
may be returning a reference to objects in the BVH in R and the compiler needs to know these references will be valid after
the call. This actually turned out to be a tough error to work through and the Rust IRC channel was very helpful.

{% highlight rust %}
pub fn intersect<'a, F, R>(&'a self, ray: &mut Ray, f: F) -> Option<R>
        where F: Fn(&mut Ray, &'a T) -> Option<R>
{% endhighlight %}

Now to traverse geometry in the BVH and intersect the instances or triangles within it's as simple as passing a closure! For example,
here's the intersect call of a `BVH<Instance>` in scene.rs. Here our Fn takes a &mut Ray and &Instance and returns an Option<Intersection>
which represents the closest intersection with an instance found. The BVH will then traverse the hierarchy and call our function
on the geometry in each leaf node that our ray enters.

{% highlight rust %}
pub fn intersect(&self, ray: &mut Ray) -> Option<Intersection> {
    self.bvh.intersect(ray, |r, i| i.intersect(r))
}
{% endhighlight %}

### Lifetime Errors can be Challenging
The hardest problems I encountered when writing the traversal where lifetime errors encountered in the course of trying
to return a reference to the type in the BVH, eg. in the Intersection of DifferentialGeometry structure. Since the
error itself is given at the call to intersect it wasn't clear what I'd need to do to help the compiler sort out the
lifetimes. A short self-contained example of the error can be found on [Rust playpen](http://is.gd/uHBGlA). In the end
to make sense of the problem and figure out the solution I asked folks on the Rust IRC, who have always been
extremely helpful, and pointed out that I need to tie the lifetime of the reference passed to the caller's Fn
with the lifetime of the BVH itself, thus indicating to the compiler that the reference will be valid as
long as the BVH is alive.

Without the help of people in IRC this probably would have taken much longer to figure out (if I could have figured it
out at all). Since Rust is a very young language the documentation and compiler are still being worked on and I think
more advanced lifetime handling and error reporting are areas that could be improved on. The concepts of lifetime
and ownership are key to the language's power but can be difficult to reason about and errors can be hard
to interpret at times.

Triangle Meshes
---
**TODO:** Triangle meshes are neat. Cite sources for Rust logo, Buddha and Dragon. Mention tobj and the
process of publishing a crate on Cargo. Mention @huonw's awesome travis-ci script. Talk about
testing and benching in Rust.

Because we've implemented our BVH to be generic on the type it stores it's simple for us to also write a
triangle mesh that uses a BVH internally to accelerate intersection testing against its triangles. The triangles
themselves store the index of each of their vertices and share an Arc to Vecs containing the position, normal
and texture coordinate information. This is different than my C++ implementation where the Mesh would store
these vectors and the triangles would store a reference to the Mesh and their indices. However this implementation
will result in dangling references if the mesh is moved, copied or such and when I first tried to implement this
the Rust compiler correctly tossed up some lifetime errors. Although there's a bit of added size to each triangle
to store the Arc to each Vec this implementation is actually safe to use in general, unlike my C++ one (which I should correct).
I use a standard triangle intersection test from PBRT and after building
a BVH on the mesh's triangles we end up with a very simple mesh type. The struct is just a BVH of triangles:

{% highlight rust %}
pub struct Mesh {
    bvh: BVH<Triangle>,
}
{% endhighlight %}

Testing the triangles of the mesh for intersection is the same as testing for intersections against Instances
of geometry but we instead return an `Option<DifferentialGeometry>`.

{% highlight rust %}
impl Geometry for Mesh {
    fn intersect(&self, ray: &mut linalg::Ray) -> Option<DifferentialGeometry> {
        self.bvh.intersect(ray, |r, i| i.intersect(r))
    }
}
{% endhighlight %}

### Publishing Crates on Cargo
The next thing we'd like to do with triangle mesh geometry is load up some models and render them! The
[Wavefront OBJ](http://en.wikipedia.org/wiki/Wavefront_.obj_file) format is relatively simple to load (at least if
you're only doing triangles/triangle strips) and is widely supported in modeling software like Blender,
making it easy to find meshes and convert them as needed. While it's possible to write an OBJ loader integrated
into the ray tracer I thought this seemed like a cool opportunity to learn about publishing my own Crates
(a library) with [Cargo](https://crates.io), especially since managing dependencies with Cargo is very smooth.

To load OBJ files I've written [tobj](https://github.com/Twinklebear/tobj) which takes inspiration from the
OBJ loader I use in my C++ projects, [tinyobjloader](https://github.com/syoyo/tinyobjloader). To figure out how
to publish the crate online I followed [the guide on publishing](http://doc.crates.io/crates-io.html#publishing-crates)
and [here it is](https://crates.io/crates/tobj)! Now adding this library as dependency to tray\_rust can be done
by adding `tobj = "0.0.8"` to the `[dependencies]` list and the crate will be downloaded and available for use
via `extern crate tobj;`.

For some extra fun I used the Travis-CI integration discussed in Huon's "Travis on the Train" series
([part 1](http://huonw.github.io/blog/2015/04/helping-travis-catch-the-rustc-train/),
[part 2](http://huonw.github.io/blog/2015/05/travis-on-the-train-part-2/)) and now can take advantage of Travis-CI
to run tests and even build and upload [rustdoc](http://www.willusher.io/tobj/tobj/) for tobj, which is really
convenient. I've started using this for tray\_rust as well.

Measured Material Data
---
**TODO:** Not a ton to say here as well, mention process of reading binary data via buffered reader
and the byteorder crate. Comes back to Rust's super cool extension trait functionality.

The final thing we need to make some really gorgeous images are some high quality material models. There are
a wide range of analytical models that we can choose from that attempt to accurately model various
types of materials, a few are [listed on Wikipedia](http://en.wikipedia.org/wiki/Bidirectional_reflectance_distribution_function#Models).
The current analytical models supported in tray\_rust are Lambertian, Oren-Nayar and specular relfection and transparency.
An alternative to analytical models is to directly use measured data acquired by taking real world objects
and scanning them in some way. These measured models can be a bit harder to use as they don't offer as much
artist flexibility, but since I'm a terrible artist this isn't really a problem! On excellent source of measured
BRDF data is the [MERL BRDF Database](http://www.merl.com/brdf/) which has a wide variety of regularly sampled
isotropic surface material data, and is what we'll be using here.

The file format itself is a bit odd but is well explained in [PBRT](http://pbrt.org/), after loading the data in access
is actually quite efficient but the process of loading and scaling the data can seem a bit odd. The file stores
scaled RGB values for samples taken at various angles of incident and exiting light where components are scaled by
(1500, 1500, 1500 / 1.66) in the file, so we must apply the inverse. Additionally the values in the files are stored
in little Endian double precision and in chunks, so all the red values come first, followed by green and then blue. To load these binary files
I made use of the [byteorder crate](https://crates.io/crates/byteorder).

Results
---
The result of this work is some really gorgeous eye-candy! To celebrate Rust's 1.0 release I've rendered a Rust logo model made by 
[Nylithius on BlenderArtists](http://blenderartists.org/forum/showthread.php?362836-Rust-language-3D-logo) with a few different materials
and later on with some friends from the computer graphics world, the Stanford Buddha and Dragon from the
[Stanford 3D Scanning repository](http://graphics.stanford.edu/data/3Dscanrep/). The Rust logo has 28,844 triangles, the version
of the Buddha I used has 1,087,474 triangles and the version of the Dragon has 871,306 triangles. The render times are
from some reasonably beefy machines we have at the lab with dual
[Xeon E5-2680 @ 2.7GHz](http://ark.intel.com/products/64583/Intel-Xeon-Processor-E5-2680-20M-Cache-2_70-GHz-8_00-GTs-Intel-QPI),
I ran tray\_rust with 32 threads for these renders. There is also still a bug in my BVH construction which is leading
to less than optimal BVHs so I think these times could be improved a bit once I get that fixed. Area lights are also
still on my todo list so the scene is just light by a single point light and we don't get any nice soft shadows.

<div class="col-lg-12 col-md-12 col-xs-12" style="text-align:center">
<a href="http://i.imgur.com/JouSgr5.png"><img class="img-responsive" src="http://i.imgur.com/JouSgr5.png"></a>
<p>800x600, 1024 samples, using a black oxidized steel material. Render time: 540208ms</p>
</div>
<div class="col-lg-12 col-md-12 col-xs-12" style="text-align:center">
<a href="http://i.imgur.com/t3bLX9W.png"><img class="img-responsive" src="http://i.imgur.com/t3bLX9W.png"></a>
<p>800x600, 1024 samples, using a two layer silver material. Render time: 533727ms</p>
</div>
<div class="col-lg-12 col-md-12 col-xs-12" style="text-align:center">
<a href="http://i.imgur.com/Wm2k6CI.png"><img class="img-responsive" src="http://i.imgur.com/Wm2k6CI.png"></a>
<p>800x600, 1024 samples, using a black obsidian material. Render time: 538330mss</p>
</div>
<div class="col-lg-12 col-md-12 col-xs-12" style="text-align:center">
<a href="http://i.imgur.com/I4KSpzq.png"><img class="img-responsive" src="http://i.imgur.com/I4KSpzq.png"></a>
<p>800x600, 1024 samples, using a brass material. Render time: 539784ms</p>
</div>
<div class="col-lg-12 col-md-12 col-xs-12" style="text-align:center">
<a href="http://i.imgur.com/fUEv6Au.png"><img class="img-responsive" src="http://i.imgur.com/fUEv6Au.png"></a>
<p>800x600, 1024 samples, smallpt scene with specularly reflective and transparent spheres. Render time: 195862ms</p>
</div>
<div class="col-lg-12 col-md-12 col-xs-12">
<a href="http://i.imgur.com/9QU6fOU.png"><img class="img-responsive" src="http://i.imgur.com/9QU6fOU.png"></a>
<p>1920x1080, 2048 samples, the logo is using black oxidized steel, the Stanford Buddha
is using a gold metallic paint and the Stanford Dragon is using a blue acrylic. Render time: 4432127ms</p>
</div>

Final Thoughts
---
There are still a few things left on my todo list for tray\_rust. I need to fix my BVH construction so it doesn't give some
poor quality splits, add support for area lights and make some kind of scene file format so that changing a scene doesn't require
re-compiling. I'd also like to implement some more material models, I have a few nice microfacet based analytic models in tray
to port over and would like to add some sort of rough glass model. Materials with subsurface scattering properties would also
be really cool to implement. Depending on time I've also got some more advanced rendering methods on my list such as
bidirectional path tracing and [vertex connection and merging](http://iliyan.com/publications/VertexMerging), a recently introduced
powerful and robust rendering approach that has seen fast adoption in commercial renderers. There are of course other methods
that are fun to work with as well, such as photon mapping and its variants, but I'm not sure how much more I want to add to tray\_rust.
I'm definitely not aiming to implement something as massive and impressive as [Mitsuba](https://www.mitsuba-renderer.org/),
which supports pretty much everything under the sun.

After working with Rust for a longer period and following changes and development up to 1.0 more closely I'm pretty happy with the language,
and look forward to continuing to use it. There are of course some complaints and annoyances I've run into as well though. Good learning material
can be a bit hard to come by but this is being worked on and should be solid by 1.0. Compiler error messages can be a bit difficult to figure out
sometimes, especially relating to lifetime issues. Fortunately the community is very helpful in working through these and it sounds like this is on
the list of post-1.0 work. It's also not possible at the moment to implement memory pool style patterns in Rust, which I used extensively
in my C++ version. Finally compile times can be pretty slow, especially when compiling with link time optimization. Rust is still a young
language and I think all of these issues (and more) are on the [priorities after 1.0](https://internals.rust-lang.org/t/priorities-after-1-0/1901)
list and will be addressed in the future.

If you have comments, suggestions for improvements or just want to say "hi" feel free to comment below, [tweet at me](https://twitter.com/_wusher)
or ping me on IRC (I'm Twinklebear on freenode and moznet).
The code for the Rust ray tracer is MIT licensed and available on [Github](https://github.com/Twinklebear/tray_rust).

#### References
<p>
[MPBM03] <span style="font-variant:small-caps">Wojciech Matusik, Hanspeter Pfister, Matt Brand and Leonard McMillan</span>:
A Data-Driven Reflectance Model. In <i>ACM Transactions on Graphics 2003</i>.
</p>
<p>Add Kajiya citation?</p>

<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

