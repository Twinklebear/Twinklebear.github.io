---

published: false
layout: post
title: "Rendering Animations in Rust"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation"]

---
{% include JB/setup %}

I've spent a while working on various features of tray\_rust along with some big fixes, performance
improvements and so on. The topic of this post is more exciting than that though, as it's something
I've never implemented before: animation! We'll take a look at a simple way for sampling time in our scene, how
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

Now that our scene will contain motion of objects over time, we need some way to account for it when rendering
the scene. A straightforward approach is to consider time as just another variable we're integrating over in
the [rendering equation](https://en.wikipedia.org/wiki/Rendering_equation). Now when we shoot a ray to sample
a pixel in the scene we're also sampling a specific point in time with that ray, so each ray now has a time value
associated with it. This time value will allow us to find out where objects are when this ray "see's" the scene
so to speak. Since we blend our samples together to form the final image this will also let us compute nice motion
blur, though it will require more samples as it introduces further variance into the image which
will appear as more noise.

To pick the time ranges to assign to rays we chop the time for the scene, say four seconds, into frames. We can
pick a common film framerate of 24 frames per second, or whatever we want really. At 24 FPS we'll need 96 frames
for this 4 second scene, where each frame captures 1/24 of a second of the scene. We can have a simple loop
over the frames to render that will update the camera's shutter open/close times appropriately and when picking
the time value for a ray we scale our random sample into the current shutter time. This way we'll advance
the scene forward in time (so we see motion) and sample a range of time values at each frame while the shutter
is open (so we see motion blur).

An interesting thing to explore is how changing the shutter open time effects the captured frame. In movies
the shutter is typically open for 1/48 of a second for a 1/24 second frame time. It's open for half
the frame since the shutter that blocks the light is 180 degrees, rotating 360 degrees every 1/24 a second. In
[Saving Private Ryan](http://cinemashock.org/2012/07/30/45-degree-shutter-in-saving-private-ryan/) they
used a 45 degree shutter, resulting in a shutter open time of just 1/192 seconds, resulting in less
motion blur appearing on moving objects. This is not currently implemented in tray\_rust but is on my list
and should be cool to try out.

**TODO:** Maybe we could have some kind of D3/SVG animation showing the different shutters in motion?

# Transforming Objects Over Time

Since the rays we trace through the scene now have time values associated with them we can do a similar
thing for the transformations of our objects to get rigid body animation. By associating a time value with
a transformation and interpolating between transformations at two (or more) time points we can move an
in the scene and compute both motion blur and animate it over multiple frames. This falls out of our rays
having time points associated with them, so when we want to compute where the object is at this ray's time
we can interpolate its keyframe transformations to compute its actual transform at the time that the ray
is traversing the scene.

**TODO: mention no skeletal animation.**

Another nice effect of this is that since the camera is also positioned by a transformation we can animate
it in the same way that we do other objects in the scene, by just computing where the camera actually is
when the ray leaves it by interpolating its keyframe transforms.

Now that things are moving in the scene we also need our BVH to account for this, the bounding boxes it stores
for objects must actually bound them over the time range that we're rendering. If we don't do this
objects can actually disappear or get clipped because we won't traverse the acceleration structure to
intersect them since we think we miss their bounding box! My current approach is to sample the
transformation of the object
over the time range being rendered (for the current frame) and find the union of the bounding boxes. This is
not the most accurate solution ([pbrt-v3](https://github.com/mmp/pbrt-v3) introduces a better one) but is
simple to implement. To try and avoid the BVH becoming useless due to the motion of objects causing all their
bounding boxes to intersect I also re-build it each frame to only contain the motion bounds of objects within the
current smaller time range we're actually rendering (e.g. 1/24 of a second at 24 FPS).

# Smooth Animations with B-Splines

We would also like the motion that our objects go through to be smooth, that is the paths they follow should
not have discontinuities (unless we actually want them) and they should smoothly accelerate when starting
and stopping the motion. This leaves us with a small problem, since linear interpolation between the nearest
two transforms at some time will give exactly this (**TODO show lines vs. b-spline)**,
as it's equivalent to just drawing lines between the control transforms we specify for the path.

To compute smooth animation paths from the list of control transforms for the object we can use
[B-Splines](https://en.wikipedia.org/wiki/B-spline), which will smoothly interpolate the transforms,
though may not exactly pass through them. There wasn't an existing B-Spline interpolation library in
Rust so I created
a [generic one](https://github.com/Twinklebear/bspline) which lets us see more of the power of Rust's trait
system. A B-Spline curve can be used to interpolate any "control point" type that can be linearly
interpolated (so 2/3D positions, or even RGB colors), since computing a point on the spline can be
expressed as a sequence of linear interpolations that build on each other.
So in Rust our library can define a trait for types that can be linearly interpolated:

{% highlight rust %}
pub trait Interpolate {
    // Linearly interpolate between `self` and `other` using `t`, for example:
    // self * (1.0 - t) + other * t
    fn interpolate(&self, other: &Self, t: f32) -> Self;
}
{% endhighlight %}

For convenience we can even provide a default implementation for any types which can be multiplied by a float,
added to each other and copied (to return the result). Then if someone uses our Interpolate trait they
won't necessarily need to write this simple implementation themselves, they would only need to provide it
in the case that their type needed some special handling (e.g. spherical linear interpolation for quaternions).

{% highlight rust %}
impl<T: Mul<f32, Output = T> + Add<Output = T> + Copy> Interpolate for T {
    fn interpolate(&self, other: &Self, t: f32) -> Self {
        *self * (1.0 - t) + *other * t
    }
}
{% endhighlight %}

Then our B-Spline curve can operate on any type that implements Interpolate and Copy. We need copy to save
intermediate results and return the final interpolated value. So our B-Spline struct turns out like this:

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

**TODO:** Something comparing linear motion with b-spline pathed motion? Or some kind of ease-in/out thing.
Could maybe show an example B-Spline curve w/ D3 compared to a linear interpolation.

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

