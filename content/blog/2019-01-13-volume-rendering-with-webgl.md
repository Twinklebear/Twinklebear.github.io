---
layout: single
title: "Volume Rendering with WebGL"
date: 2019-01-13
category: webgl
tags: [webgl, javascript]
url: /webgl/2019/01/13/volume-rendering-with-webgl
params:
  mathjax: true

---

{{< numbered_fig src="https://cdn.willusher.io/img/YqdyKCj.webp"
	caption=`Example volume renderings, using the WebGL volume renderer described in this post.
	Left: A simulation of the spatial probability distribution of electrons in a high potential protein molecule.
	Right: A CT scan of a Bonsai Tree. Both datasets are from the [Open SciVis Datasets](https://klacansky.com/open-scivis-datasets) repository.`
>}}

In scientific visualization, volume rendering is widely used to visualize
3D scalar fields. These scalar fields are often
uniform grids of values, representing,
for example, charge density around a molecule,
an MRI or CT scan, air flow around an airplane, etc.
Volume rendering is a conceptually straightforward method
for turning such data into an image: by sampling the data
along rays from the eye and assigning
a color and transparency to each sample, we can
produce useful and beautiful images of such scalar fields
(see Figure 1).
In a GPU renderer, these 3D scalar fields are stored
as 3D textures; however, in WebGL1 3D textures were
not supported, requiring additional hacks to emulate them
for volume rendering.
Recently, WebGL2 added support for 3D textures,
allowing for an elegant and fast volume renderer to be
implemented entirely in the browser.
In this post we'll discuss the mathematical background
for volume rendering, and how it can be implemented in
WebGL2 to create an interactive volume renderer
entirely in the browser!
Before we start, you can try out the volume renderer
described in this post [online](https://www.willusher.io/webgl-volume-raycaster/).

<!--more-->

# 1. Introduction

{{< numbered_fig width="80%"
	src="/img/webgl-volumes/volume-rendering-cloud.svg"
	caption=`Physically based volume rendering, accounting for absorption and
	light emission by the volume, along with scattering effects.`
>}}

To produce a physically realistic image from volumetric data, we need to model how light rays
are absorbed, emitted, and scattered by the medium (Figure 2).
While modelling light transport through a medium at this level
produces beautiful, physically correct images, it is too expensive for
interactive rendering, which is our goal in visualization software.
In scientific visualization, our end goal is
to allow scientists to interactively explore their data, enabling them
to ask and answer questions about their research problem.
As a complete physically based model with scattering is too expensive
for interactive rendering, visualization applications
employ a simplified emission-absorption model, either ignoring expensive
scattering effects, or approximating them in some way.
Here we will just focus on the emission-absorption model.

In the emission-absorption model, we only compute lighting effects occurring
directly along the black ray in Figure 2, and ignore those from the dashed gray
rays. Rays passing through the volume and reaching the eye accumulate color emitted by the
volume, and are attenuated as they traverse it due to absorption by the volume.
If we trace rays from the eye through the volume, we can
compute they light received at the eye by integrating the ray through
the volume, to accumulate the emission and absorption along the ray.
Given a ray from the eye which enters the volume at \\(s = 0\\) and exits it at
\\(s = L\\), we can compute the light which
is received at the eye using the following integral:

$$
C(r) = \int_0^L C(s) \mu(s) e^{-\int_0^s \mu(t) dt} ds
$$

As the ray passes through the volume, we integrate
the emitted color \\(C(s)\\) and absorption \\(mu(s)\\)
at each point \\(s\\) along the ray. The emitted color at each point is attenuated as it returns
to the eye by the volume's absorption up to that point, which is computed with the
\\(e^{-\int_0^s \mu(t) dt}\\) term.

In general, this integral cannot be computed analytically, and
we must use a numeric approximation. We approximate the integral by taking a set of \\(N\\)
samples along the ray on the interval \\(s = [0, L]\\) each a distance \\(Delta s\\) apart
(Figure 3), and summing these samples together. The attenuation term at
each sample point becomes a product series, accumulating the absorption at
previous samples.

$$
C(r) = \sum_{i=0}^N C(i \Delta s) \mu (i \Delta s) \Delta s
		\prod_{j=0}^{i-1} e^{-\mu(j \Delta s) \Delta s}
$$

To simplify this sum further, we approximate the
previous attenuation term \\( (e^{-\mu(j \Delta s) \Delta s}) \\)
by its Taylor series. We also introduce alpha
\\( alpha(i \Delta s) = \mu(i \Delta s) \Delta s \\)
for convenience. This yields the front-to-back alpha compositing equation:

$$
C(r) = \sum_{i=0}^N C(i \Delta s) \alpha (i \Delta s)
		\prod_{j=0}^{i-1} (1 - \alpha(j \Delta s))
$$

{{< numbered_fig width="80%"
	src="/img/webgl-volumes/volume-rendering-cloud-labelled.svg"
	caption="Computing the emission-absorption rendering integral on a volume."
>}}

The above equation amounts to a for loop, where we step the ray through
the volume, and accumulate the color and opacity iteratively as we go.
This loop continues until the ray either leaves the volume,
or the accumulated color has become opaque \\( (\alpha = 1) \\).
The iterative computation of the above sum is done using the familiar
front-to-back compositing equations:

$$
	\hat{C}\_i = \hat{C}\_{i-1} + (1 - \alpha\_{i-1}) \hat{C}(i \Delta s)
$$

$$
	\alpha_i = \alpha_{i - 1} + (1 - \alpha_{i-1}) \alpha(i \Delta s)
$$

In these final equations we use pre-multiplied opacity for
correct blending, \\(\hat{C}(i\Delta s) = C(i\Delta s) \alpha(i \Delta s)\\).

To render an image of the volume we just need to trace a ray
from the eye through each pixel, and perform the above
iteration for each ray intersecting the volume.
Each ray (or pixel) we process is independent, so if we want
to render the image quickly all we need is a way to process
a large number of pixels in parallel.
This is where the GPU comes in.
By implementing the raymarching process in a fragment shader
we can leverage the parallel computing power of the GPU to
implement a very fast volume renderer!

<!--
**Todo: mention that the volume represents a continous field,
so when we sample along the grid we'll do trilinear interpolation to
get the sample value**
<figure>
	<img class="img-fluid" width="70%"
		src="/img/webgl-volumes/raymarching-grid.svg"/>
	{% assign figurecount = figurecount | plus: 1 %}
	<figcaption><i>Figure {{figurecount}}:
	Raymarching the volume grid.
	</i></figcaption>
</figure>
-->

# 2. GPU Implementation with WebGL2

To run our raymarching work in the fragment shader, we need
to get the GPU to run the fragment shader for the pixels we want
to trace rays through.
However, the OpenGL pipeline works on geometric primitives (Figure 5),
and does not have a direct method to run the fragment shader on
some region of the screen.
To work around this, we can render some proxy geometry to execute
the fragment shader on the pixels we want to render.
Our approach to rendering the volume will be
similar to those of [Shader Toy](https://www.shadertoy.com/)
and [demoscene renderers](https://iquilezles.org/www/material/nvscene2008/nvscene2008.htm),
which render two full-screen triangles to execute the fragment
shader, which then does the real rendering work.

{{< numbered_fig
	src="/img/webgl-volumes/webgl-triangle-pipeline.svg"
	caption=`The OpenGL pipeline in WebGL consists of two programmable shader stages:
	the vertex shader, responsible for transforming input
	vertices into clip space, and the fragment shader, responsible
	for shading pixels covered by triangle.`
>}}

While rendering two full-screen triangles as in ShaderToy will work, it would run
an unnecessary amount of fragment processing in the case that the
volume does not cover the entire screen. This case is actually
quite common, as users zoom out to get an overview of the dataset or study
large-scale features. To restrict the fragment processing work
to just those pixels touched by the volume, we can rasterize
the bounding box of the volume grid, and then run the raymarching
step in the fragment shader.
Finally, we don't want to render
both the front and back faces of the box, as this could run our
fragment shader twice, depending on the order the triangles are rendered in.
Furthermore, if we render just the front faces we'll run into issues
when the user zooms in to the volume, as the front faces will
project behind the camera and be clipped, causing those pixels
to not be rendered. To allow users to
zoom fully into the volume, we'll render just the back faces of
the box. Our resulting rendering pipeline is shown in Figure 6.

{{< numbered_fig
	src="/img/webgl-volumes/webgl-volume-raycast-pipeline.svg"
	caption=`The WebGL pipeline for raymarching a volume. We rasterize
	the backfaces of the volume's bounding box to run
	the fragment shader work for those pixels touched by the volume.
	Within the fragment shader we step rays through the volume
	to render it.`
>}}

In this pipeline, the bulk of real rendering work is done in the
fragment shader; however, we can still use the vertex shader and
the fixed function interpolation hardware for some useful computation.
Our vertex shader will transform the volume based on the user's camera
position, and compute the ray direction and eye position
in the volume space, and pass them to the fragment shader.
The ray direction computed at each vertex is then interpolated
across the triangle for us by the fixed function interpolation
hardware on the GPU, letting us compute the ray directions for
each fragment a bit cheaper. However, these directions
may not be normalized when we get them in the fragment
shader, so we'll still need to normalize them.

We'll render the bounding box as a unit \\([0, 1]\\)
cube, and scale it by the volume axes to support non-uniform sized
volumes. The eye position is transformed into the unit cube,
and the ray direction is computed in this space. Raymarching in
the unit cube space will allow us to simplify our texture sampling
operations during the raymarching in the fragment shader, since we'll already be in the
\\([0, 1]\\) texture coordinate space of the 3D volume.

The vertex shader we'll use is shown below, the rasterized
back faces colored by the view ray direction are shown in Figure 7.

```glsl
#version 300 es
layout(location=0) in vec3 pos;
uniform mat4 proj_view;
uniform vec3 eye_pos;
uniform vec3 volume_scale;

out vec3 vray_dir;
flat out vec3 transformed_eye;

void main(void) {
	// Translate the cube to center it at the origin.
	vec3 volume_translation = vec3(0.5) - volume_scale * 0.5;
	gl_Position = proj_view * vec4(pos * volume_scale + volume_translation, 1);

	// Compute eye position and ray directions in the unit cube space
	transformed_eye = (eye_pos - volume_translation) / volume_scale;
	vray_dir = pos - transformed_eye;
};
```

{{< numbered_fig
  width="70%"
  src="https://cdn.willusher.io/img/FMWE7UR.webp"
	caption="The volume bounding box back faces, colored by ray direction."
>}}

Now that we have our fragment shader running on the pixels that we need to
render the volume for, we can raymarch the volume and compute a color
for each pixel. In addition to the ray direction and eye position we computed
in the vertex shader, we'll need a few more inputs to the fragment shader
to render the volume. Of course, the first thing we'll need is a 3D texture
sampler to sample the volume.
However, the volume is just a block of scalar values,
if we used these scalars directly as the color (\\(C(s)\\)) and opacity (\\(\alpha(s)\\)) values,
the rendered grayscale image may not be very useful to the user. For example,
it would not be possible to highlight regions of interest with different colors,
or to make noise and background regions transparent to hide them.

To give the user control over the color and
opacity assigned to each sample value, scientific visualization renderers use an
additional colormap, called a *Transfer Function*.
The transfer function specifies what color and opacity value should
be assigned for a given value sampled from the volume.
Although more complex
transfer functions exist, a typical one acts as a simple color lookup table,
and can be represented as a 1D color and opacity texture (RGBA). To apply the transfer
function when raymarching the volume, we can sample the
transfer function's texture using the scalar value sampled from the volume texture.
The returned color and opacity values are then used as \\(C(s)\\) and
\\(\alpha(s)\\) for the sample.

The final additional input we need for our fragment shader are the volume dimensions,
which we'll use to compute a ray step size (\\(\Delta s\\)) to sample
each voxel along the ray at least once. As the [conventional equation for a ray](http://www.pbr-book.org/3ed-2018/Geometry_and_Transformations/Rays.html)
is \\(r(t) = \vec{o} + t \vec{d}\\), we will switch the terminology in the code to match,
and refer to \\(\Delta s\\) as \\(\texttt{dt}\\). Similarly, the range along the ray overlapped by
the volume, \\(s = [0, L]\\), will be referred to as \\([\texttt{tmin}, \texttt{tmax}]\\).

To raymarch the volume in our fragment shader, we will do the following:

1. Normalize the view ray direction received as input from the vertex shader;
2. Intersect the view ray against the volume bounds to determine the interval \\([\texttt{tmin}, \texttt{tmax}]\\)
	to raymarch over to render the volume;
3. Compute the step size \\(\texttt{dt}\\) such that each voxel is sampled at least once;
4. Starting from the entry point at \\(r(\texttt{tmin})\\), step the ray through the volume until
	the exit point at \\(r(\texttt{tmax})\\).
	1. At each point, sample the volume and use the transfer function to assign a color
		and opacity;
	2. Accumulate the color and opacity along the ray using the front-to-back compositing equation.

As an additional optimization, we can include an early exit condition in our
raymarching loop to break out when the accumulated color is nearly opaque.
Once the color is nearly opaque, any samples after will have little to no
contribution to the pixel, as their color is fully absorbed by the medium
before reaching the eye.

The full fragment shader for our volume renderer is shown below, with
additional comments marking each step in the process.

```glsl
#version 300 es
precision highp int;
precision highp float;

uniform highp sampler3D volume;
// WebGL doesn't support 1D textures, so we use a 2D texture for the transfer function
uniform highp sampler2D transfer_fcn;
uniform ivec3 volume_dims;

in vec3 vray_dir;
flat in vec3 transformed_eye;

out vec4 color;

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(0);
	const vec3 box_max = vec3(1);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

void main(void) {
	// Step 1: Normalize the view ray
	vec3 ray_dir = normalize(vray_dir);

	// Step 2: Intersect the ray with the volume bounds to find the interval
	// along the ray overlapped by the volume.
	vec2 t_hit = intersect_box(transformed_eye, ray_dir);
	if (t_hit.x > t_hit.y) {
		discard;
	}
	// We don't want to sample voxels behind the eye if it's
	// inside the volume, so keep the starting point at or in front
	// of the eye
	t_hit.x = max(t_hit.x, 0.0);

	// Step 3: Compute the step size to march through the volume grid
	vec3 dt_vec = 1.0 / (vec3(volume_dims) * abs(ray_dir));
	float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));

	// Step 4: Starting from the entry point, march the ray through the volume
	// and sample it
	vec3 p = transformed_eye + t_hit.x * ray_dir;
	for (float t = t_hit.x; t < t_hit.y; t += dt) {
		// Step 4.1: Sample the volume, and color it by the transfer function.
		// Note that here we don't use the opacity from the transfer function,
		// and just use the sample value as the opacity
		float val = texture(volume, p).r;
		vec4 val_color = vec4(texture(transfer_fcn, vec2(val, 0.5)).rgb, val);

		// Step 4.2: Accumulate the color and opacity using the front-to-back
		// compositing equation
		color.rgb += (1.0 - color.a) * val_color.a * val_color.rgb;
		color.a += (1.0 - color.a) * val_color.a;

		// Optimization: break out of the loop when the color is near opaque
		if (color.a >= 0.95) {
			break;
		}
		p += ray_dir * dt;
	}
}
```

{{< numbered_fig
width="80%"
src="https://cdn.willusher.io/img/vtZqe4m.webp"
caption="The final rendered result on the Bonsai, from the same viewpoint as in Figure 6."
>}}

That's it!
The renderer described in this post will be able to create images like the one shown in Figure 8,
and those in Figure 1. You can also try it out [online](https://www.willusher.io/webgl-volume-raycaster/#Bonsai).
For brevity I've omitted the Javascript code needed to setup a WebGL context,
upload the volume and transfer function
textures, setup the shaders, and render the cube to actually render the volume;
the full code for the renderer is available on [Github](https://github.com/Twinklebear/webgl-volume-raycaster)
for reference.
If you have any questions about this post, feel free to get in touch via [Twitter](https://twitter.com/_wusher).

