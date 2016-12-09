---
published: true
layout: post
title: "Porting a Ray Tracer to Rust, part 2"
description: "Shading and parallelism"
category: 
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

As mentioned in my [previous post]({% post_url 2014-12-30-porting-a-ray-tracer-to-rust-part-1 %}) I spent the past month-ish
working on improving both the rendering capabilities and performance of [tray\_rust](https://github.com/Twinklebear/tray_rust).
While it's not yet capable of path tracing we can at least have light and shadow and shade our objects with diffuse or specularly
reflective and/or transmissive materials. Along with this I've improved performance by parallelizing
the rendering process using Rust's multithreading capabilities. Although ray tracing is a trivially parallel task there are
two pieces of state that must be shared and modified between threads: the pixel/block counter and the framebuffer.
With Rust's strong focus on safety I was worried that I would have to resort to unsafe blocks to share these
small pieces of mutable state but I found that the [std::sync module](http://doc.rust-lang.org/std/sync/index.html)
provided safe methods for everything I needed and performs quite well. While it's difficult to compare against
[tray](https://github.com/Twinklebear/tray) (my initial C++ version) as the design of tray\_rust has diverged quite 
a bit I'll put some performance numbers in the multithreading section.

During the past month [Rust](http://www.rust-lang.org/) has also seen some pretty large changes and is currently
in its 1.0 alpha release with the [first beta](http://blog.rust-lang.org/2014/12/12/1.0-Timeline.html)
fast approaching.

<!--more-->

The Material System
---
The material system used in [PBRT](http://pbrt.org/) makes heavy use of memory arenas to avoid making lots of small allocations of
the various BxDFs that the [BSDF](http://en.wikipedia.org/wiki/Bidirectional_scattering_distribution_function) for the surface is
composed of during rendering. Instead large blocks of memory are allocated up front
and the small allocations needed during rendering are made by marking sections in these regions as used. The memory is re-used by
marking everything free again once we've finished tracing an eye ray since we don't need to preserve any of this information across
primary rays. From some discussion in the [Hacker News](https://news.ycombinator.com/item?id=8818611) thread for part 1 it sounds like it isn't
currently possible to implement a memory pool in Rust although it is being worked on. There is the
[std::arena](http://doc.rust-lang.org/arena/index.html) module but I'm not sure if it meets my
needs. It may be possible now to write something similar to the [memory pool](https://github.com/Twinklebear/tray/blob/master/include/memory_pool.h)
I used in tray based off the implementation of the generic Arena allocator in std::arena,
I'll have to investigate further. Do let me know if you have any thoughts in this area!

To get around this for now without introducing a lot of allocations during rendering I chose to have the materials allocate a Vec of
their BxDFs when they're created and then return BSDFs that just refer to these BxDFs. We do still need to allocate a BSDF
on the stack each time and return it (via moving) when getting the surface properties for an object but this isn't too
expensive.

#### Working with BxDFs using Iterators

Since a surface's properties can be defined through a combination of BxDFs we need to consider contributions from all of them
to determine the color of the surface when shading some intersection. Additionally we need to filter them
to only consider those that are relevant to the current lighting calculation, eg. if we're computing reflected light we wouldn't want to
waste time evaluating transmissive BxDFs. Using the [std::iter](http://doc.rust-lang.org/std/iter/index.html) module we can perform these
operations cleanly and safely without running into any bounds checking overhead that we would have when accessing a Vec
by index. As a simple example the following snippet returns the number of BxDFs that match some set of BxDF type flags.

{% highlight rust %}
pub fn num_matching(&self, flags: EnumSet<BxDFType>) -> usize {
    self.bxdfs.iter().filter(|ref x| x.matches(flags)).count()
}
{% endhighlight %}

A more interesting example is taken from the `BSDF::eval` method. This method computes the contribution of all BxDFs
for some pair of incident and outgoing light directions and returns the total color.

{% highlight rust %}
self.bxdfs.iter().filter_map(|ref x| if x.matches(flags) { Some(x.eval(&w_o, &w_i)) } else { None })
    .fold(Colorf::broadcast(0.0), |x, y| x + y)
{% endhighlight %}

It's worth mentioning that the current BSDF implementation is incredibly naive, since the only currently supported materials are
either diffuse, specularly reflective or specularly reflective and transmissive they only have a single component
per light interaction (reflection or transmission) and we can get away without doing any random sampling of
the BSDF components. When path tracing is implemented and more complex materials are added this will have to be fixed, however
it won't change the above code listing by much.

Iterators combined with lambdas and closures make for some very powerful functionality. Similar expressions
can of course be written in C++11/14 using lambdas and the corresponding methods from the
[algorithms library](http://en.cppreference.com/w/cpp/algorithm), although I'm not sure if there's similar functionality
to filter and filter\_map provided by the C++ standard library.

If we take a slight tangent away from materials for a moment, we find that we can even express the operation of checking
a ray for intersection with all the instances of geometry in the scene
as a fold operation! By capturing the ray as a mutable borrow in the closure and modifying its max\_t member after each
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

**Edit 1/31/15**: [/u/Veedrac](https://www.reddit.com/r/rust/comments/2u8jtd/porting_a_ray_tracer_to_rust_part_2/co6onlx) pointed
out that we could make the intersection code even clearer using the [or](http://doc.rust-lang.org/std/option/enum.Option.html#method.or) method
of Option, I've updated the code to now be:

{% highlight rust %}
self.instances.iter().fold(None, |p, ref i| i.intersect(ray).or(p))
{% endhighlight %}

Using this method I've also chosen a fix for the [poor design decision](/2014/12/30/porting-a-ray-tracer-to-rust-part-1/#a-poor-design-choice)
I made last time. Following from some helpful discussion in the comments
on part 1, Reddit, Hacker News and IRC I've made the Geometry trait and Instance struct return different types from their intersect methods
and will instead implement the BVH to take types that implement a Boundable trait. Traversal will then be done by
returning an iterator that traverses the BVH and iterates over all potentially intersected
objects. The caller can then perform whatever operations it likes over the objects returned by the iterator, be it intersection testing on
Geometry or Instances or anything really.

Parallelism
---
While ray tracing is an extremely easy problem to parallelize there's still room for some interesting implementations, and I think
the one I've gone with is pretty neat and leaves the door open for even more fun. It's possible to
write a ray tracer that doesn't do any synchronization by assigning threads their work up front and having them only write to disjoint regions
of the framebuffer, but this design doesn't do a very good job of load balancing (what if one thread gets all the hard pixels?)
and makes it very difficult to implement [reconstruction filtering](http://www.luxrender.net/wiki/LuxRender_Render_settings#Filter)
(now samples affect adjacent pixels as well, and the regions are no longer disjoint). To have a robust and high quality
renderer it's worth it to support this minimal level of synchronization between threads, to avoid hurting performance too much
this synchronization should be kept as lightweight as possible, ideally using only atomics.

In tray I followed PBRT and implemented the framebuffer using atomic floats with C++'s `std::atomic<float>` type, updating pixel values
using compare exchange loops. This same method is also possible to implement in Rust by either directly using the LLVM intrinsics
or working through the [`AtomicUsize`](http://doc.rust-lang.org/std/sync/atomic/struct.AtomicUsize.html) type to create an atomic float
identical to `std::atomic<float>`. To implement the atomic float method I would still need to write some minor bits of unsafe code to
transmute the bits of the float to a usize to go through AtomicUsize, so I decided to try Rust's safe lock-free multi-producer
single-consumer channel in [std::sync::mpsc](http://doc.rust-lang.org/std/sync/mpsc/) first,
as this wouldn't require any unsafe code on my end. I still chose to divide up work in the same way I did previously with an array
of block start positions which are indexed by an atomic uint (AtomicUsize in Rust), each thread just does a fetch add to find
the next block to work on and returns when there are none left.

To render the scene I spawn a number of worker threads and hand each of them a send end of the mpsc channel where they will write
their sample results, sending the x, y position and color of the sample. The receive end of the channel is held onto by the
main thread which reads samples from the channel and writes them to the framebuffer until all send ends have closed. This implementation
provides some interesting trade-offs with the atomic float framebuffer method, instead of conflicting on every channel of the
pixel (RGB and weight) threads will only conflict on the two atomics in the channel when trying to send their samples.
However if we aren't doing reconstruction filtering then the threads in the atomic float method never conflict and just pay the cost
of a few atomic operations while in the channel implementation threads will conflict since they're all still writing
to the same channel. Another option I didn't look into yet is to give each thread their own channel to write to and use select to
read samples as they come in from each channel. If this would also be lock-free from the sender side then it's possible this is
an even better implementation since the worker threads don't actually need to care about each others samples since they
aren't writing them to the framebuffer. I'd be interested to hear other people's thoughts on this implementation.

The mpsc channel implementation does perform quite nicely, using 8 worker threads on my desktop with an i7-4790K @ 4GHz we
can render the [smallpt scene](http://www.kevinbeason.com/smallpt/) with one sample per pixel in 144ms! What's even more exciting about the channel
implementation is that it easily extends to support rendering across multiple machines on a network.
Each thread on the worker machines would send their samples to a network thread which would batch up samples and send them to the master machine
instead of directly to a framebuffer thread. These samples would then be received either by the master's framebuffer thread directly or
picked up on a network thread and sent through the same mpsc channel used by the worker threads. The overhead of setting up the network
and communicating samples would probably take much more time than rendering our scene with a simple Whitted
integrator but will be worth pursuing once path tracing is implemented. The code for the worker and framebuffer threads is located in
[main.rs](https://github.com/Twinklebear/tray_rust/blob/master/src/main.rs).


<img src="http://i.imgur.com/o7VKbBq.png" class="img-fluid">

There are a few stray black/white pixels in the image but I think these are just sampling artifacts and should be cleaned up once we
start taking more than one sample per pixel. Here we're just hitting an uncommon path where we get a black or white
result, at least that's what I hope is the case.

This version is also run without any architecture specific optimizations (to my knowledge) such as taking advantage of any available
SIMD instructions like you would get when compiling C or C++ with `-march=native`. There is a flag to pass to rustc to
enable these optimizations however I'm not sure how to pass it to rustc through Cargo.
It looks to currently be an open issue, [#544](https://github.com/rust-lang/cargo/issues/544) and
[#1137](https://github.com/rust-lang/cargo/issues/1137), if it is possible now please do let me know.
I'd expect at least some performance gain with the use of auto-vectorization and SSE/AVX instructions.

#### Sharing Immutable Data Between Threads
In a ray tracer we also need to share some immutable data between threads so that they all know what scene they're rendering.
In Rust this is done with atomic reference counted pointers using the [Arc](http://doc.rust-lang.org/std/sync/struct.Arc.html)
struct. This works pretty nicely although I ran into some minor annoyances. Currently if you want to put a trait in an Arc
it must be in a Box as well, even though the Arc has it's own box (this may have changed with unsized types, see below).
That is to say if we had a trait Geometry and we wanted to share some instance between threads we can't currently write:

{% highlight rust %}
// This doesn't work!
let geom = Arc::new(Sphere::new()) as Arc<Geometry>;
// Instead we must box the sphere first
let geom_correct = Arc::new(Box::new(Sphere::new()) as Box<Geometry>);
{% endhighlight %}

Additionally it's not possible to immutably borrow an object across multiple threads even if it can be proven that the object
being borrowed outlives all the threads. From what I've been told both of these issues are being worked on, the Arc\<Trait\>
type might actually be possible now with unsized types but I've had some difficulty finding reading material on how to use these.
If anyone has a link to a good write-up on unsized types it'd be much appreciated, or I'll bug folks in IRC for info about it.
As for sharing Arcs vs. immutable borrows (what I did in the C++ version) I think I prefer using Arcs even though both
methods should be valid to write in the language eventually. Note that we don't have any overhead from updating the reference
count during rendering since we can immutably borrow within the thread to refer to hit geometry and instances.

Managing Dependencies with Cargo
---
In addition to helping build your project, its docs, and run tests [Cargo](https://crates.io/) is also a powerful dependency
management tool. During some of the updates to Rust the more experimental and niche modules such as EnumSet got moved
out into [collect-rs](https://github.com/Gankro/collect-rs), getting this crate and linking my project was really easy to do
by adding the [package](https://crates.io/crates/collect) as a dependency with Cargo. It's also possible to depend on git repositories
as I've done with [image](https://github.com/PistonDevelopers/image) by specifying a git dependency, so now tray\_rust can output
PNG and JPEG images!

For executables Cargo also locks the versions of your dependencies so others trying to build your project will build with the same versions
of the libraries you're building with, making it smoother to build other people's packages and programs. It even works well on
Windows which is always a bit of a hassle when trying to manage C or C++ dependencies. Rust is still quite young and the
ecosystem is very small compared to C and C++ so the comparison isn't really fair but I'm hopeful that Cargo will
keep dependency management painless even as the ecosystem grows.

Final Thoughts
---
After working with Rust for longer I'm pretty happy with how the language is shaping up. To name a few features I
had fun with over the past month, match expressions and the powerful iterator module are really nice to work with.
The community is also very friendly and helpful, the Rust IRC and subreddit have been great resources over
the past month and [This Week in Rust](http://this-week-in-rust.org/) is invaluable when keeping up with
changes in the nightlies or just finding cool Rust related write-ups and discussion.

#### Until Next Time
For part 3 I'll work on getting a proper path tracing implementation running and fix some lingering bugs in the current
code that I've worked around to render the scene for this post. I'll also take a look at the performance of giving
each thread its own channel vs. a shared mpsc and possibilities for rendering across multiple machines.
Path tracing will need much more compute power to render the scene quickly and networked rendering should be really fun to play with.

If you have comments, suggestions for improvements or just want to say "hi" feel free to comment below, [tweet at me](https://twitter.com/_wusher)
or ping me on IRC (I'm Twinklebear on freenode and moznet).
The code for the Rust ray tracer is MIT licensed and available on [Github](https://github.com/Twinklebear/tray_rust).

