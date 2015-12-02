---

published: false
layout: post
title: "Rendering Animations in Rust"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation"]

---
{% include JB/setup %}

In this post we'll look at implementing a pretty awesome new feature in [tray\_rust](https://github.com/Twinklebear/tray_rust),
something I've never implemented before: animation! We'll take a look at a simple way for sampling time in our scene, how
we can associate time points with transformations of objects to make them move and how to compute smooth animation
paths with B-Splines. Then we'll wrap up with rendering a really cool animation by using 60 different
nodes spread across two clusters at my lab to render subsequences of the animation's frames.

# TODO: Topics to cover

1. Concept of sampling time with rays to get motion and motion blur
	- Could also talk about possibilities to extend current system with varying shutter times vs. frame time

2. Transforms of objects (and light emission) are now tied to time values
	- Also mention no skeletal animation currently
	- Mention that since the camera is also positioned w/ transform we can animate it as well
	- Re-building the BVH each frame

3. B-spline transformations for rigid body animation paths (mention bspline crate)
	- Maybe we can show some comparisons of SVG animations or something with linear vs. b-spline based?

4. Rendering of the raytracing compo animation, describe how the frames were distributed and
rendering time spent
	- Also mention limitations of no graphical editor, describe how people could make their own scenes,
	should commit the compo scene to repo

<!--more-->

# Rendering Time

Now that objects in our scene move over time, we need some way to account for time when rendering
a scene. A straightforward approach is to consider time as just another variable we're integrating over in
the [rendering equation](https://en.wikipedia.org/wiki/Rendering_equation). When we shoot a ray to sample
a pixel in the scene we're also sampling a specific point in time, so each ray will have a time value
associated with it. This time value will allow us to find out where objects are when this ray "see's" the scene
so to speak. Since we blend our samples together to form the final image this will also let us compute nice motion
blur, though it will require more samples as it introduces further variance into the image which
will appear as more noise.

To pick the time values to assign to rays we chop up the time for the scene, say four seconds, into frames. We can
pick a common film framerate of 24 frames per second, or whatever we want really. At 24 frames per second we'll need 96 frames
for a 4 second scene, where each frame captures 1/24 of a second of the scene. We can have a simple loop
over the frames to be rendered that will update the camera's shutter open/close times to span the current frame.
When firing a new ray into the scene we pick its time value by scaling a random sample in \[0, 1\] into the current shutter time range.
This way we'll advance the scene forward in time by advancing the camera's shutter time (so we see motion) and
will sample a range of time values at for frame while the shutter is open (so we see motion blur).

An interesting technique to explore is how changing how long the shutter is open for each frame effects the captured image.
In movies the shutter is typically open for 1/48 of a second for a 1/24 second frame time. It's open for half
the frame since the shutter that blocks the light is 180 degrees and rotates 360 degrees every 1/24 a second. In
[Saving Private Ryan](http://cinemashock.org/2012/07/30/45-degree-shutter-in-saving-private-ryan/) they
used a 45 degree shutter giving in a shutter open time of just 1/192 of a second. This results in less
motion blur appearing on moving objects since the range of time we sample is much shorter and the object moves
less while the shutter is open. This is not currently supported in tray\_rust but is on my list and should be really
cool to implement. For example by controlling the shutter speed we can reduce the motion blur and get a stop
motion appearance to our animations.

<figure class="img-responsive">
	<img class="img-responsive" src="http://i.imgur.com/Q98K76K.png" alt="Shutter Angle, wikipedia" />
	<figcaption><i>Shutter Angle, (<a href="https://en.wikipedia.org/wiki/Rotary_disc_shutter">Wikipedia</a>)</i>
	</figcaption>
</figure>

# Transforming Objects Over Time

To get rigid body animation we can associate an object's transform with a specific point in time and interpolate
between one or more neighboring transforms (in time) to animate it during the scene.
This falls out of our rays sampling a specific point in time, when we want to compute where the object is at
the time this ray traverses the scene we can interpolate its transformations near the time point to compute its
transform at the ray's time.
By sampling over the shutter time and across multiple frames we can move an object in the scene and
compute both motion blur as it moves. In order to properly interpolate the transforms they are decomposed
into separate translation, scaling and rotation components, interpolated separately and then combined to the
final transformation.

The camera needs no special treatment here since it's also positioned by a transformation matrix and we can
animate it in the same way that we do other objects in the scene. Instead of finding where an object is when the
ray is intersecting it we transform the ray by where the camera is when the ray is leaving it.

With objects moving around in the scene we also need our BVH to account for this, the bounding boxes it stores
for objects must actually bound them over the time range that we're rendering for the current frame. Without this
objects can actually disappear or get clipped because we won't traverse the acceleration structure to
intersect them since we think we miss their bounding box! My current approach is to sample the
transformation of the object over the current shutter time and find the union of these bounding boxes. This is
not the most accurate solution ([pbrt-v3](https://github.com/mmp/pbrt-v3) introduces a better one) but is
simple to implement. To try and avoid the BVH becoming low quality due to the motion of objects causing all their
bounding boxes to overlap (thus requiring us to traverse the tree deeper) I also re-build the BVH each frame to only contain
the motion bounds of objects within the current shutter time range we're actually rendering (e.g. 1/24 of a second at 24 FPS).

One thing worth mentioning is that currently tray\_rust doesn't support skeletal animation, just rigid body animation.
While it may be possible with the current system it would be pretty slow and inefficient.

# Smooth Animations with B-Splines

We would also like the motion that our objects go through to be smooth, that is the paths they follow should
not have discontinuities (unless we actually want them) and they should smoothly accelerate when starting
and stopping the motion. This leaves us with a small problem, since linear interpolation between the nearest
two transforms at some time is likely to give disconituities in paths and not have smooth acceleration. Additionally,
since linear interpolation is equivalent to drawing lines between the transforms we specify, it would be tedious
to set up an animation that followed a smooth curve as it would require many tiny linear paths to approximate.

To compute smooth animation paths from the list of control transforms for the object we can use
[B-Splines](https://en.wikipedia.org/wiki/B-spline), which will smoothly interpolate the transforms
though may not exactly pass through them. There wasn't an existing B-Spline interpolation library in
Rust so I created a [generic one](https://github.com/Twinklebear/bspline). In the implementation of this
library we can also explore another powerful aspect of Rust's trait system.
To compute a point on the curve we perform a sequence of linear interpolations that build on each other,
thus a B-Spline curve can be used to interpolate any "control point" type that can be linearly
interpolated, e.g. 2/3D positions, even RGB colors.
Our library can define a trait for types that can be linearly interpolated:

{% highlight rust %}
pub trait Interpolate {
    // Linearly interpolate between `self` and `other` using `t`, for example this could return:
    // self * (1.0 - t) + other * t
    fn interpolate(&self, other: &Self, t: f32) -> Self;
}
{% endhighlight %}

For convenience we can even provide a default implementation for any types which can be multiplied by a float,
added to each other and copied to return the result. Then if someone uses our Interpolate trait they
won't necessarily need to write this simple implementation themselves. Instead they would only need to provide it
in the case that their type needed some special handling (e.g. spherical linear interpolation for quaternions).

{% highlight rust %}
impl<T: Mul<f32, Output = T> + Add<Output = T> + Copy> Interpolate for T {
    fn interpolate(&self, other: &Self, t: f32) -> Self {
        *self * (1.0 - t) + *other * t
    }
}
{% endhighlight %}

The B-Spline curve provided by the library can operate on any type that implements Interpolate and Copy, copy
is needed to save intermediate results and return the final interpolated value. The B-Spline struct turns out like this:

{% highlight rust %}
pub struct BSpline<T: Interpolate + Copy> {
    // Degree of the polynomial that we use to make the curve segments
    degree: usize,
    // Control points for the curve
    control_points: Vec<T>,
    // The knot vector
    knots: Vec<f32>,
}
{% endhighlight %}

A comparison of linear interpolation with cubic B-Spline interpolation of the same set of control points is shown below,
produced by changing the degree and knots of the [plot2d example](https://github.com/Twinklebear/bspline/blob/master/examples/plot2d.rs)
included with the library.

<div class="col-xs-12 col-md-6">
<figure class="img-responsive">
	<img class="img-responsive" src="http://i.imgur.com/LL5vG3z.png" alt="Linear Interpolation" />
	<figcaption><i>Linear Interpolation</i></figcaption>
</figure>
</div>
<div class="col-xs-12 col-md-6">
<figure class="img-responsive">
	<img class="img-responsive" src="http://i.imgur.com/kk5rtXK.png" alt="Cubic B-Spline Interpolation" />
	<figcaption><i>Cubic B-Spline Interpolation</i></figcaption>
</figure>
</div>

Although the B-Spline curve provides us with a much smoother and more desirable animation path it also doesn't pass
through the control points that manipulate the curve. This makes it slightly challenging to model animations with since
I don't have a GUI editor for tray\_rust.

# Creating and Rendering a Cool Scene!

With all the pieces together all that's left to do is make a really awesome animation! This is actually
kind of challenging at the moment since I don't have any sort of graphical editor (and no plugin for Blender).
To create a scene you must type in the control transforms, knot vectors and so on into a (potentiall huge)
[JSON scene file **todo: link to scene on github**]() and then testing if you've got about what you
had in mind by rendering some lower resolution frames to see the position and motion of objects and the camera.
As a result of this putting together
even just this 25 second animation took quite a while, since I'd spend a lot of time playing with object
and camera paths, materials and so on. I also found and fixed a few bugs while working on the scene,
which took some time as well (but flushing out bugs is a good use of time). The animation is
1920x1080 and was rendered at 2048 samples per pixel, to get 25 seconds at 24 FPS it took 600 frames.

(**TODO** Embed youtube of the animation)

This animation contains quite a few different models:

- The Stanford Bunny, Buddha, Dragon and Lucy from the [Stanford 3D Scanning Repository]()
- The Utah Teapot (I used [Morgan McGuire's version]())
- Low-poly trees from [Kenny.nl]()
- The Ajax bust from [site link]()
- The Rust logo modeled by [that guy]()
- The Cow model from [place in the obj file]()

Additionally I make use of a mix of analytic and measured material models, the measured materials come
from the [MERL BRDF Database]().

## Render Time

The scene was rendered in a sort-of distributed fashion. While at the time I rendered this tray\_rust didn't
support true distributed rendering it's simple enough to just assign a subset of the frames to each machine
and have them split the work. Each frame is saved out as a png which I then stitch together into the final
movie using ffmpeg. This allows for reasonably effective use of a cluster of machines as long as you have more
frames than nodes.

To render the scene I used two clusters at my lab which are pretty quiet over the weekend. I used 40 nodes
with two Xeon X5550's per node on one cluster and 20 nodes with two Xeon E5-2660's per node for a total
of 1280 logical cores (640 physical). I tried to balance the performance of the nodes when assigning frames
to aim for an even-ish work distribution. The scene took a wall time of ~53 hours to render, due to some
of my jobs starting a bit later than other ones. The total wall time (sum of all nodes) is 2772 hours
(16.5 weeks!),
so on average it was about 46.2 hours per node of wall time. The total CPU time (sum of all nodes) was
56853 hours (6.486 years!. Without using these clusters I don't think I would have been able to render
in 1080p, simply due to how long it would have taken! I definitely need to spend some time improving the
performance of my ray tracer.

