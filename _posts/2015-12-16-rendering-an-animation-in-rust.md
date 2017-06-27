---

published: true
layout: post
title: "Rendering an Animation in Rust"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation"]

---
{% include JB/setup %}

In this post we'll look at adding a pretty awesome new feature to [tray\_rust](https://github.com/Twinklebear/tray_rust),
something I've never implemented before: animation! We'll take a look at a simple way for sampling time in our scene, how
we can associate time points with transformations of objects to make them move and how to compute smooth animation
paths with B-Splines. Then we'll wrap up with rendering a really cool animation by using 60 different
machines spread across two clusters at my lab.

<!--more-->

# Rendering Time

Now that we want objects in our scene to move over time, we need some way to account for time when rendering.
A straightforward approach is to consider time as just another variable we're integrating over in
the [rendering equation](https://en.wikipedia.org/wiki/Rendering_equation) (Wikipedia is one step ahead of us and
already has time in the equation). When we shoot a ray to sample
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
This way we'll advance the scene forward in time by advancing the camera's shutter time (so we see motion across frames) and
will sample a range of time values for a frame while the shutter is open (so we see motion blur in a frame).

An interesting technique to explore is how changing the length of time the shutter is open during a frame effects the captured image.
In movies the shutter is typically open for 1/48 of a second for a 1/24 second long frame. It's open for half
the frame since the shutter that blocks the light is 180 degrees and rotates 360 degrees every 1/24 a second. In
[Saving Private Ryan](http://cinemashock.org/2012/07/30/45-degree-shutter-in-saving-private-ryan/) they
used a 45 degree shutter so the shutter is open for just 1/192 of a second each frame. This results in less
motion blur appearing on moving objects since the range of time we sample is much shorter, so the object moves
a shorter distance while the shutter is open. This is not currently supported in tray\_rust but is on my list and should be really
cool to implement. For example by controlling the shutter speed we can reduce the amount of motion blur we see and create a stop
motion appearance in our animations.

<figure class="img-fluid">
	<img class="img-fluid" src="http://i.imgur.com/Q98K76K.png" alt="Shutter Angle, wikipedia" />
	<figcaption><i>Shutter Angle, (<a href="https://en.wikipedia.org/wiki/Rotary_disc_shutter">Wikipedia</a>)</i>
	</figcaption>
</figure>

# Transforming Objects Over Time

To get rigid body animation we can associate an object's transform with a specific point in time and interpolate
between one or more neighboring transforms (in time) to animate it during the scene.
This falls out of our rays sampling a specific point in time. When we want to compute where the object is at
the time this ray traverses the scene we can interpolate the transformations near its time sample to compute its
transform at the ray's time.
By sampling over the shutter time and across multiple frames we can move an object in the scene and
compute motion blur as it moves. In order to properly interpolate the transforms they are decomposed
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
not the most accurate solution ([pbrt-v3](https://github.com/mmp/pbrt-v3) introduces a better one) but it's
simple to implement. To try and avoid the BVH becoming low quality due to the motion of objects causing all their
bounding boxes to overlap (thus requiring us to traverse more of the tree) I also re-build the BVH each frame to only contain
the motion bounds of objects within the current shutter time range we're actually rendering (e.g. 1/24 of a second at 24 FPS).

One thing worth mentioning is that currently tray\_rust doesn't support skeletal animation, just rigid body animation.
While it may be possible with the current system it would be pretty slow and inefficient. There currently is no support
for bone transforms that would be weighted and referenced by many triangles and my current BVH construction is too slow
to efficiently handle animating complicated meshes. Animated meshes would also cause problems for the instancing system,
as different instances of the same mesh could go through different animations at the same time.

# Smooth Animations with B-Splines

We would like the motion our objects go through to be smooth, that is the paths they follow should
not have discontinuities (unless we actually want them) and they should smoothly accelerate when starting
and stopping the motion. This leaves us with a small problem, since linear interpolation between the nearest
two transforms at some time is likely to give discontinuities in paths and not have smooth acceleration. Additionally,
since linear interpolation is equivalent to drawing lines between the transforms we specify, it would be tedious
to set up an animation that followed a smooth curve as it would require many tiny linear paths to approximate the
smooth path we actually want.

To compute smooth animation paths from the list of control transforms for the object we can use
[B-Splines](https://en.wikipedia.org/wiki/B-spline), which will smoothly interpolate the transforms,
though may not exactly pass through them. There wasn't an existing B-Spline interpolation library in
Rust so I created a [generic one](https://github.com/Twinklebear/bspline). In the implementation of this
library we get the opportunity to explore another powerful aspect of Rust's trait system.
To compute a point on the curve we perform a sequence of linear interpolations that build on each other,
thus a B-Spline curve can be used to interpolate any "control point" type that can be linearly
interpolated, e.g. 2/3D positions, RGB colors or even transformations (our goal). The library can
define a trait for types that can be linearly interpolated:

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
// Mul<f32, Output = T> - This type can be multiplied by itself and returns a result of its type.
// Add<Output = T> - This type can be added together and return a result of its type.
// Copy - This type is bitwise copyable
impl<T: Mul<f32, Output = T> + Add<Output = T> + Copy> Interpolate for T {
    fn interpolate(&self, other: &Self, t: f32) -> Self {
        *self * (1.0 - t) + *other * t
    }
}
{% endhighlight %}

The B-Spline curve provided by the library can operate on any type that implements Interpolate and Copy. Copy
is required again because Interpolate does not imply the type has implemented Copy and we need it to save
intermediate results and return the final interpolated value. As a bonus since the B-Spline struct is
templated on the type being interpolated there's no virtual function overhead when calling `interpolate`.

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

<div class="row">
<div class="col-xs-12 col-md-6">
<figure class="img-fluid">
	<img class="img-fluid" src="http://i.imgur.com/LL5vG3z.png" alt="Linear Interpolation" />
	<figcaption><i>Linear Interpolation</i></figcaption>
</figure>
</div>
<div class="col-xs-12 col-md-6">
<figure class="img-fluid">
	<img class="img-fluid" src="http://i.imgur.com/kk5rtXK.png" alt="Cubic B-Spline Interpolation" />
	<figcaption><i>Cubic B-Spline Interpolation</i></figcaption>
</figure>
</div>
</div>

Although the B-Spline curve provides us with a much smoother and more desirable animation path it also doesn't pass
through the control points that manipulate the curve. This makes it somewhat challenging to model animations since
I don't have a GUI editor for tray\_rust and it's tough to visualize how the curve looks when typing in control
transforms and knots.

# Creating and Rendering a Cool Scene!

With the pieces together all that's left to do is make a really awesome animation! This is actually
a bit challenging at the moment since I don't have any sort of graphical editor (and no plugin for Blender).
To create a scene you type in the control transforms, knot vectors and so on into a potentially huge
JSON scene file (for example [here's this animation's scene](https://github.com/Twinklebear/tray_rust/blob/master/scenes/tr15.json)).
Then to check if you've got about what you
had in mind render some lower resolution frames to see the motion of objects and the camera.
Putting together even just this short 25 second animation took quite a while, since I'd spend a
lot of time tweaking the object and camera paths, materials and so on. I also found and fixed a few bugs
while working on the animation which took some time as well, but bug fixing is time well spent. The animation is
1920x1080 and was rendered at 2048 samples per pixel. To get 25 seconds of animation at 24 frames
per second we need to render 600 individual frames. Each frame is saved out as a separate png, to produce
the animation I used ffmpeg to stitch them together into a video.

Here's the resulting video. If you'd prefer to watch on YouTube I've [uploaded it there](https://youtu.be/sweEpfRyDlE) as well but the quality is
not as good due to compression. If your browser doesn't play the video properly you can
[download it](http://sci.utah.edu/~will/rt/rtc_2015_med_quality_420p.mp4) and watch it locally.

<video class="img-fluid" src="http://sci.utah.edu/~will/rt/rtc_2015_med_quality_420p.mp4" type="video/mp4" controls
	style="padding-top:16px;padding-bottom:16px;" preload="metadata" poster="http://i.imgur.com/ftJyrnA.jpg">
Sorry your browser doesn't support HTML5 video, but don't worry you can download the video
<a href="http://sci.utah.edu/~will/rt/rtc_2015_med_quality_420p.mp4">here</a> and watch it locally.
</video>

The animation contains quite a few different models:

- The Stanford Bunny, Buddha, Dragon and Lucy are from the
[Stanford 3D Scanning Repository](http://graphics.stanford.edu/data/3Dscanrep/)
- The Utah Teapot (I used [Morgan McGuire's version](http://graphics.cs.williams.edu/data/meshes.xml))
- Low-poly pine trees by [Kenney](http://kenney.nl/)
- The Ajax bust is from [jotero](http://forum.jotero.com/viewtopic.php?t=3)
- A Rust logo model by [Nylithius](http://blenderartists.org/forum/showthread.php?362836-Rust-language-3D-logo)
- The Cow model is from Viewpoint Animation, I downloaded the model from the Suggestive Contours paper
[example page](http://gfx.cs.princeton.edu/proj/sugcon/models/).

I also make use of a mix of analytic and measured material models, the measured materials come
from the [MERL BRDF Database](http://www.merl.com/brdf/).

## Compute Time

When I rendered this animation tray\_rust didn't support true distributed rendering (multiple machines
cooperating on a single frame), however a simple and effective
approach is to assign a subset of the frames to different machines so they split the work.
Since each frame is saved out as a png each node's job is completely independent of the others so we can
just launch the renderer on a bunch of machines and not worry much about fault handling or
communication overhead (since there's none). This actually achieves pretty effective use of a cluster,
as long as you have more frames than nodes.

To render the scene I used two clusters at my lab which don't get much use over the weekend. I used 40 nodes
with two Xeon X5550's per node on one cluster and 20 nodes with two Xeon E5-2660's per node on the other,
for a total of 1280 logical cores (640 physical). I tried to balance the performance of the nodes when
assigning frames to aim for an even-ish work distribution. The scene took a wall time of about 53 hours to render
due to some of my jobs starting a bit later than other ones. The total wall time (sum of all nodes) is 2772 hours
(16.5 weeks!), on average rendering took about 46.2 hours per node (wall time). The total CPU time
(sum of all nodes) was 56853 hours (6.486 years!). Without using these clusters I don't think I would have
been able to render in such high quality, just due to how long it would have taken. I definitely need to
spend some more time improving the performance of tray\_rust.


# Next Time

Although tray\_rust didn't support distributed rendering when I rendered this scene I've just recently
implemented it, which is what we'll take a look at in the next post. As a
quick teaser we'll see how to divide work for a single frame between multiple nodes, properly handle nodes
reporting multiple frames at different times and how to read results from multiple nodes on one thread using
[mio](https://github.com/carllerche/mio) for asynchronous I/O.

