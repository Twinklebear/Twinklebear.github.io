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
While it's not yet capable of path tracing we can at least have light and shadow and shade our objects with diffuse or specularly
reflective/transmissive materials. Along with this I've looked into improving performance by parallelizing
the rendering process using Rust's multithreading capabilities. Although ray tracing is a trivially parallel task there are
two pieces of state that must be shared and modified between threads: the pixel/block counter and the framebuffer.
With Rust's strong focus on safety I was worried that I would have to resort to unsafe blocks to share these
small pieces of mutable state but I found that Rust's [std::sync module](http://doc.rust-lang.org/std/sync/index.html)
provided safe methods for everything I needed and performs quite well. While it's difficult to compare against the C++ version
since the design of tray\_rust has diverged quite a bit I'll put some performance numbers in the multithreading section.

During the past month [Rust](http://www.rust-lang.org/) has also seen some pretty large changes and is currently
in it's 1.0 alpha release with the [first beta](http://blog.rust-lang.org/2014/12/12/1.0-Timeline.html)
fast approaching. If you've been holding off on trying out the language due to how quickly it was changing the
beta is probably a good point to jump in as the language will be much more [stable](http://blog.rust-lang.org/2014/10/30/Stability.html).

<!--more-->

The Material System
---
The material system used in [PBRT](http://pbrt.org/) makes heavy use of memory arenas to avoid making a lot of small allocations of
the various BxDFs that the [BSDF](http://en.wikipedia.org/wiki/Bidirectional_scattering_distribution_function) for the surface is
composed of during rendering. Instead large blocks of memory are allocated up front
and the small allocations needed during rendering are then made by marking sections in the buffers as used. The memory is re-used by
marking everything free again once we've finished tracing an eye ray since we don't need to preserve any of this information across
primary rays. From some discussion in the [Hacker News](https://news.ycombinator.com/item?id=8818611) thread it sounds like it isn't
currently possible to implement a memory pool in Rust although it is being worked on. There is the
[std::arena](http://doc.rust-lang.org/arena/index.html) module although I'm not sure if those implementations meet my
needs. It may be possible now though to write something similar to the memory pool I used in
[tray](https://github.com/Twinklebear/tray/blob/master/include/memory_pool.h) in Rust based on the implementations of the generic
Arena allocator, I'll have to investigate further. Do let me know if you have any thoughts in this area!

To get around this for now without introducing a lot of allocations during rendering I chose to have the materials allocate a Vec of
their BxDFs when they're created and then return BSDFs that just refer to these BxDFs. We do still need to allocate a BSDF
on the stack each time and return it (via moving) when getting the surface properties for some material but this isn't too
expensive.

#### Working with BxDFs using Iterators

Since a surface's properties can be defined through a combination of BxDFs we need to consider contributions from all of them
to determine the color of the surface when shading some intersection. Additionally we need to filter them
by only those that are relevant to the current lighting calculation, eg. if we're computing reflected light we wouldn't want
to evaluate transmissive BxDFs. Using Rust's [std::iter](http://doc.rust-lang.org/std/iter/index.html) module we can perform these
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

It's worth mentioning that the current BSDF implementation is incredible naive, since we know that our materials are
either diffuse, specularly reflective or specularly reflective and transmissive and thus only have a single component
per light interaction (reflection or transmission) we don't do any random sampling of
the BSDF components like we should be doing. When path tracing is implemented this will have to be fixed, however
it won't effect the code listing above.

Iterators combined with lambdas and closures make for some very powerful functionality. Similar expressions
can of course be written in C++11 using lambdas and the corresponding methods from the [algorithms library](http://en.cppreference.com/w/cpp/algorithm)
although I'm not sure if there's similar functionality to `filter` and `filter_map` provided in the C++ standard library.

If we take a slight tangent away from materials for a moment, we find that we can even express the operation of checking
a ray for intersection with all the instances of geometry in the scene
as a fold operation! By capturing the ray as a mutable borrow in the closure and modifying its `max_t` member after each
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
on part 1, Reddit, Hacker News and IRC I've made the Geometry trait and Instance struct return different types from their intersect methods
and will instead implement the BVH to take types that implement a Boundable trait. Traversal will then be done by
returning an iterator that performs the bounding volume intersection tests and iterates over all potentially intersected
geometry. The caller can then perform whatever operations it likes over the potentially intersected geometry or instances.

Parallelism
---
While ray tracing is an extremely easy problem to parallelize there's still room for some interesting implementations, and I think
the implementation I've gone with in Rust is pretty fun and leaves the door open for even more fun. It is of course possible to
write a ray tracer that doesn't do any synchronization. If threads are assigned there work up front and only write to disjoin regions
of the framebuffer there will never be conflicts as they never see or interact with each other's work. While brain-dead simple this
design doesn't do a very good job of load balancing (what if one thread gets all the hard pixels?) and makes it impossible to implement
[reconstruction filtering](http://www.luxrender.net/wiki/LuxRender_Render_settings#Filter) (now samples affect adjacent pixels as well,
introducing conflicts).

In tray I followed PBRT and implemented the framebuffer using atomic floats with C++'s `std::atomic<float>` type, updating pixel values
using compare exchange. While this method is also possible to implement in Rust by either directly calling the LLVM intrinsics
or working through the [`AtomicUsize`](http://doc.rust-lang.org/std/sync/atomic/struct.AtomicUsize.html) type to create an atomic float
Rust also provides lock-free multi-producer single-consumer communication primitives in [std::sync::mpsc](http://doc.rust-lang.org/std/sync/mpsc/).
To implement the AtomicUsize method I would need to write some minor bits of unsafe code to transmute the bits of the float to a usize,
so I decided to try the channels method and see how performance was first, as this wouldn't require any unsafe code. I still chose to
divide up work in the same way I did previously using an array of block start positions which are indexed by an atomic int, each
thread just does a fetch add to find the next spot to work on and returns when there are no more blocks to be rendered.

To render the scene I spawn some number of worker threads and hand each of them a send end of my mpsc channel where they will write
their sample results to, sending the x, y position and color of the sample. The receive end of the channel is held onto by the
main thread which just gets samples from the channel and writes them to the framebuffer until all sending ends have closed. This implementation
provides some interesting trade-offs with the atomic float framebuffer method, instead of conflicting on every channel of the
pixel (RGB and weight) threads will only conflict on the single atomic in the channel when trying to write their sample to the queue.
However if we aren't doing reconstruction filtering then the threads in the atomic float buffer never conflict and just pay the cost
of a few atomic operations while in the channel implementation threads are far more likely to conflict since they're all still writing
to the same channel. Another option I didn't look into yet is to give each thread their own channel to write to and use select to
read samples as they come in from each channel, I'd be interested to hear other people's thoughts on this possibility.

As far as performance goes I'm really happy with how the mpsc channel method performs, using 8 threads on my desktop with an i7-4790K @ 4GHz tray\_rust
can render the [smallpt scene](http://www.kevinbeason.com/smallpt/) below in 144ms! What's more exciting about the channel
implementation is that it leaves the door open to easily
extend the renderer to support rendering across multiple machines on a network. Each worker machine instead of sending its samples to
a framebuffer thread would send them to a network thread which would batch up samples and send them to the master machine. These
samples would then be recieved either by the master machine's framebuffer thread directly or picked up on a network thread and sent
through the same mpsc channel that the master machine's worker threads use to communicate samples to the framebuffer thread. The overhead of
setting up the network and communicating samples would probably take much more time than rendering our scene with a simple Whitted
integrator but is probably worth pursuing once path tracing is implemented.

<img src="http://i.imgur.com/o7VKbBq.png" class="img-responsive">

Managing Dependencies with Cargo
---
In addition to helping build your project, its docs and run tests [Cargo](https://crates.io/) is also a powerful dependency
management tool.

Final Thoughts
---
Mention not finding how to overload operator += for types.

