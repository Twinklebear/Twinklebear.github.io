---
published: false
layout: post
title: "Porting a Ray Tracer to Rust, part 2"
description: "Whitted Recursive Ray Tracing"
category: 
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

As mentioned in my [previous post]({% post_url 2014-12-30-porting-a-ray-tracer-to-rust-part-1 %}) I spent the past month-ish
working on improving both the rendering capabilities and performance of [tray\_rust](https://github.com/Twinklebear/tray_rust).
While it's not yet capable of path tracing
we can at least have light and shadow and shade our objects with diffuse or specularly reflective/transmissive materials
using the Whitted recursive ray tracing algorithm. Along with this I've looked into improving performance by parallelizing
the rendering process using Rust's multithreading capabilities. Although ray tracing is a trivially parallel task there are
two pieces of state that must be shared and modified between threads: the pixel/block counter and the framebuffer.
With Rust's strong focus on safety I was worried that I would have to resort to unsafe blocks to share these
small pieces of mutable state but I found that Rust's [std::sync module](http://doc.rust-lang.org/std/sync/index.html)
provided safe methods for everything I needed and performs quite well. While it's difficult to compare against the C++ version
since the design of tray\_rust has diverged quite a bit I'll put some performance numbers for the tray\_rust in the multithreading section.

During the past month [Rust](http://www.rust-lang.org/) has seen some pretty large changes and is currently
in it's 1.0 alpha release with the [first beta](http://blog.rust-lang.org/2014/12/12/1.0-Timeline.html)
fast approaching. If you've been holding off on trying out the language due to how quickly it was changing the
beta is probably a good point to jump in as the language will be much more [stable](http://blog.rust-lang.org/2014/10/30/Stability.html).

<!--more-->

The Material System
---
The material system used in [PBRT](http://pbrt.org/) makes heavy use of memory pools to avoid making a lot of small allocations of
the various BxDFs that the BSDF for the surface is composed of during rendering. Instead large blocks of memory are allocated up front
and the small allocations needed during rendering are then made by marking sections in the buffers as used. The memory is re-used by
marking everything free again once we've finished tracing an eye ray since we don't need to preserve any of this information across
primary rays. From some discussion in the [Hacker News](https://news.ycombinator.com/item?id=8818611) thread it sounds like it isn't
currently possible to implement a memory pool in Rust although it is being worked on. Do let me know if this is possible now though!

To get around this without introducing a lot of allocations during rendering I chose to have the materials allocate a Vec of
their BxDFs when they're created and then return BSDFs that just refer to these BxDFs. We do still need to allocate a BSDF
on the stack each time and return it (via moving) when getting the surface properties for some material but this isn't too
expensive.

#### Working with BxDFs using Iterators

Since a surface's properties can be defined through a combination of BxDFs that together form its BSDF when determining
the color of the surface we need to consider contributions from all these BxDFs. Additionally we need to filter them
by only those that are relevant to the current lighting calculation, eg. if we're computing reflected light we wouldn't want
to evaluate transmissive BxDFs. Using Rust's [std::iter](http://doc.rust-lang.org/std/iter/index.html) we can perform these
operations cleanly and safely without running into any bounds checking overhead that we would have when accessing a Vec
by index. As a simple example the following snippet returns the number of BxDFs in the BSDF that match some set of BxDF type flags.

{% highlight rust %}
/// Return the number of BxDFs matching the flags
pub fn num_matching(&self, flags: EnumSet<BxDFType>) -> usize {
    self.bxdfs.iter().filter(|ref x| x.matches(flags)).count()
}
{% endhighlight %}

A more interesting example is taken from the `BSDF::eval` method. This method computes the contribution of all BxDFs in
the BSDF for some pair of incident and outgoing light directions and returns the total color.

{% highlight rust %}
// Find all matching BxDFs and add their contribution to the material's color
self.bxdfs.iter().filter_map(|ref x| if x.matches(flags) { Some(x.eval(&w_o, &w_i)) } else { None })
    .fold(Colorf::broadcast(0.0), |x, y| x + y)
{% endhighlight %}

Iterators combined with lambdas and closures make for some very powerful functionality. Similar expressions
can of course be written in C++11 using lambdas and the corresponding methods from the [algorithms library](http://en.cppreference.com/w/cpp/algorithm)
although I'm not sure if there's similar functionality to `filter` and `filter_map` provided in the standard library.

If we take a slight tangent away from materials for a moment, we find that we can even express the operation of checking
a ray for intersection with all the instances of geometry in the scene
as a fold operation. By capturing the ray as a mutable borrow in the closure and modifying its `max_t` member after each
intersection we can use the following to find the nearest intersection and return it, or None if nothing was hit.

{% highlight rust %}

/// Test the ray for intersections against the objects in the scene.
/// Returns Some(Intersection) if an intersection was found and None if not.
pub fn intersect(&self, ray: &mut Ray) -> Option<Intersection> {
    // We can always return the next hit found since the ray's max_t value is updated
    // after an intersection is found. Thus if we find another hit we know that one
    // occured before any previous ones.
    self.instances.iter().fold(None, |p, ref i|
                                match i.intersect(ray) {
                                    Some(h) => Some(h),
                                    None => p,
                                })
}
{% endhighlight %}

Using this method I've also chosen a fix for the poor design decision I made last time. Following from some helpful discussion in the comments
on part 1, Reddit, Hacker News and IRC I've made the Geometry and Instance return different types from their intersect methods
and will instead implement the BVH to just take types that implement a Boundable trait. Traversal will then be done by
returning an iterator that performs the bounding volume intersection tests and iterates over all possibly intersected
geometry. Then the caller can perform whatever operations it likes over the potentially intersected geometry or instances.

