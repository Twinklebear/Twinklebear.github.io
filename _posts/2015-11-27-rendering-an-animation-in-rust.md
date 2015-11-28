---

published: false
layout: post
title: "Rendering Animations in Rust"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation"]

---
{% include JB/setup %}

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
a pixel in the scene we're also sampling a specific point in time with that ray, so each ray has a time value
associated with it. This time value will allow us to find out where objects are when this ray "see's" the scene
so to speak. Since we blend our samples together to form the final image this will also let us compute nice motion
blur effects, though it will require more samples since it introduces further variance into the scene which
will appear as more noise.

To pick the time ranges to assign to rays we chop the time for the scene, say four seconds, into frames. We can
pick a common film framerate of 24 frames per second, or whatever we want really. At 24 FPS we'll need 96 frames
in total for this scene where each one captures about 0.041667 seconds of the scene. We can have a simple loop
over the frames to render that will update the camera's shutter open/close times appropriately and when picking
the time value for a ray we scale our random sample into the current shutter time.

An interesting thing to explore is how changing the shutter open time effects the captured frame. In movies
the shutter is typically open for 1/48 of a second for a 1/24 second frame time, it's open for half
the frame since the shutter that blocks the light is 180 degrees. In [Saving Private Ryan](http://cinemashock.org/2012/07/30/45-degree-shutter-in-saving-private-ryan/) they used a 45 degree shutter, resulting in a shutter
open time of just 1/192 seconds, resulting in much less motion blur appearing on moving objects. This is not
currently implemented in `tray_rust` but is on my list and should be cool to try out.

# Transforming Objects Over Time

Since the rays we trace through the scene will now have time values associated with them we can do a similar
thing for the transformations of our objects to get rigid body animation. By associating a time value with
a transformation and interpolating between transformations at two (or more) time points we can sample a
moving object in the scene and compute both motion blur and animate it over multiple frames. TODO: mention
no skeletal animation.

> Another nice effect of this is that since the camera is also positioned by a transformation we can animate
it in the same way that we do other objects in the scene.

Now that things are moving in the scene we also need our BVH to account for this, the bounding boxes it stores
for objects in it must actually bound them over the time range that we're rendering. If we don't do this
objects can actually disappear or get clipped as we won't traverse the acceleration structure to intersect them
since we think we miss their bounding box! My current approach is to sample the transformation of the object
over the time range being rendered (for the current frame) and find the union of the bounding boxes. This is
not the most accurate solution ([pbrt-v3](https://github.com/mmp/pbrt-v3) introduces a better one) but is
simple to implement. To try and avoid the BVH becoming useless due to the motion of objects causing all their
bounding boxes to intersect I also re-build it every frame to only contain the bounds of motion within the
current smaller time range we're actually rendering.

# Smooth Animations with B-Splines


# Creating and Rendering a Cool Scene!

At last the pay-off...

