---
layout: single
title: "Faster Shadow Rays on RTX"
date: 2019-09-06
url: /graphics/2019/09/06/faster-shadow-rays-on-rtx
tags: [graphics, raytracing]

---

To determine if a hit point can be directly lit by a light source in the scene
we need to perform a visibility test between the point and the light.
In a path tracer we must perform at least one visibility test per hit point
to shade the point, or two if we're using multiple importance sampling (one for the light
sample, and one for the BSDF sample). When rendering just ambient occlusion,
e.g., for baking occlusion maps, we may send even more shadow rays per hit-point.
Fortunately, shadow rays can be relatively cheap to trace, as
we don't care about finding the closest hit point or computing surface shading information,
but just whether or not something is intersected by the ray.
There are a few options and combinations of ray flags which we can use
when deciding how to trace shadow rays on RTX (through DXR, OptiX or Vulkan).
I recently learned a method for skipping all hit group shaders (any hit, closest hit)
and instead using just the miss shader to determine if the ray is *not* occluded.
This was a bit non-obvious to me, though has been used by others
(see [Chris Wyman's Intro to DXR](http://intro-to-dxr.cwyman.org/presentations/IntroDXR_ShaderTutorial.pdf)
and [Sascha Willems's Ray Tracing Shadows Example](https://github.com/SaschaWillems/Vulkan/tree/master/data/shaders/glsl/raytracingshadows)
After switching to this approach in [ChameleonRT](https://github.com/Twinklebear/ChameleonRT)
I decided to run a small benchmark comparing some of the options for tracing shadow rays.
I'll also discuss an extra trick we can use to simplify the shader binding table setup,
which lets us skip creating an occlusion hit group entirely.

<!--more-->

# RTX Shadow Ray Implementation Options

The three typical options for implementing shadow rays on opaque geometry I'll compare are:

### Occlusion Group with Any Hit (OGAH)
A standard approach is to use an occlusion hit group with an any hit shader, which just accepts the hit and terminates
the ray when it's called. In DXR our any hit shader would just call `AcceptHitAndEndSearch`, in OptiX `optixTerminateRay` and in
Vulkan `terminateRayNV`. We can then call trace with any hit shaders forced to be run,
even for geometry created with the opaque flag, by setting the force non-opaque flag (enforce any hit in OptiX).
As a result, the first hit the
RTX hardware encounters to test with the any hit shader will be reported as the final hit to accept
and the ray will terminate. The closest hit shader is then run, which can update
the ray data payload to mark the ray as occluded, after which control returns back to the original trace call.

### Occlusion Group with Closest Hit (OGCH)
Another option, the one I had been using previously, is to create an occlusion hit group with
only a closest hit shader. We then set both the force opaque (disable any hit in OptiX) and
accept first hit (terminate on first hit in Vulkan/OptiX) flags when tracing the ray. As a result,
the any hit shader is skipped and the hardware immediately accepts the first candidate hit encountered
along the ray as the final ray and calls the closest hit shader,
which can update the ray data payload to mark the ray occluded as before.
The small improvement of **OGCH** over **OGAH** is that the hardware can accept the first hit
encountered and terminate the ray without having to call an any hit shader. However,
this method would not work if we wanted to run the any hit shader to support alpha cut-out textures.

### Ray Flags Only (RFO)
The final option, which I'm using now, is to use the ray flags passed to trace ray to skip
the any hit shader and terminate on first hit as in **OGCH**, but to also skip executing the
closest hit shader. The result is that the hardware traverses until it either misses, and calls the
miss shader for our shadow ray, or terminates and returns back to the caller immediately upon
encountering any candidate intersection. A key difference here is that we must now use the ray payload
to tell us if the ray is *not* occluded; since the any and closest hit shaders will no longer be
run, we can't use them to tell us if the ray was occluded. Instead, we assume the ray was occluded
and use the miss shader to update the ray payload if it was not occluded.
The advantage of **RFO** over **OGCH** and **OGAH** is that we skip all shader execution for
rays which are occluded, and can still terminate traversal whenever any candidate hit is
encountered. Since this method only calls the miss shader, it might also be referred to as "miss shader only".
An additional benefit of **RFO** is that we can even skip making an occlusion hit group entirely,
and just use the primary ray group for the hit group, since we know it will never be called anyway.

For example, in DXR/HLSL this would look like:

```hlsl
struct OcclusionHitInfo {
    int hit;
};

// Trace the shadow ray, assuming it is occluded
occlusion_hit.hit = 1;
TraceRay(scene,
    RAY_FLAG_FORCE_OPAQUE
    | RAY_FLAG_ACCEPT_FIRST_HIT_AND_END_SEARCH
    | RAY_FLAG_SKIP_CLOSEST_HIT_SHADER,
    0xff,
    PRIMARY_RAY_TYPE, // Note: HG never called
    1,                // No HG's so we set HG stride = 1
    OCCLUSION_RAY_TYPE,
    shadow_ray,
    shadow_hit);

// The shadow ray miss shader marks the ray as not occluded if
// no hit was encountered
[shader("miss")]
void ShadowMiss(inout OcclusionHitInfo occlusion : SV_RayPayload) {
    occlusion.hit = 0;
}

```

### Benchmarks

<div class="col-12 row">
    <div class="col-12 col-md-6">
        <img class="img-fluid" src="https://cdn.willusher.io/img/izqMaBd.webp"/>
        <p class="text-center"><i>Sponza, 262K triangles</i></p>
    </div>
    <div class="col-12 col-md-6">
        <img class="img-fluid" src="https://cdn.willusher.io/img/DYdbQgS.webp"/>
        <p class="text-center"><i>Unshaded, primary ray + shadow only</i></p>
    </div>
</div>

I ran some small tests in [ChameleonRT](https://github.com/Twinklebear/ChameleonRT) with the DXR backend,
rendering the Sponza scene from [Morgan McGuire's Computer Graphics Archive](https://casual-effects.com/data/)
on an RTX 2070 at 1280x720 and 2560x1440. For these I ran both a full path traced and shaded version, and a version
which only traces primary rays and shadow rays at the first hit point. The fully shaded and path traced
version will give some idea of how this change effects the overall performance of a renderer,
while the unshaded primary + shadow version will better isolate the impact of the shadow ray change.
To measure the performance of each method I tracked both the
the rays traced per-second and render time per-frame, shown in the table below.

<table class="table">
    <thead>
        <tr>
        <th scope="col">Dataset</th>
        <th class="text-right" scope="col">OGAH</th>
        <th class="text-right" scope="col">OGCH</th>
        <th class="text-right" scope="col">RFO</th>
        </tr>
    </thead>
    <tbody>
        <tr>
        <td scope="col">Sponza (720p)</td>
        <td class="text-right" scope="col">371.65 MRay/s (17.06 ms)</td>
        <td class="text-right" scope="col">373.75 MRay/s (17.00 ms)</td>
        <td class="text-right" scope="col">375.67 MRay/s (16.84 ms)</td>
        </tr>
        <tr>
        <td scope="col">Sponza Unshaded (720p)</td>
        <td class="text-right" scope="col">378.26 MRay/s (4.93 ms)</td>
        <td class="text-right" scope="col">389.31 MRay/s (4.88 ms)</td>
        <td class="text-right" scope="col">398.92 MRay/s (4.82 ms)</td>
        </tr>
        <tr>
        <td scope="col">Sponza (1440p)</td>
        <td class="text-right" scope="col">386.35 MRay/s (64.44 ms)</td>
        <td class="text-right" scope="col">387.23 MRay/s (64.30 ms)</td>
        <td class="text-right" scope="col">389.21 MRay/s (63.97 ms)</td>
        </tr>
        <tr>
        <td scope="col">Sponza Unshaded (1440p)</td>
        <td class="text-right" scope="col">1.004 GRay/s (7.24 ms)</td>
        <td class="text-right" scope="col">1.004 GRay/s (7.24 ms)</td>
        <td class="text-right" scope="col">1.005 GRay/s (7.23 ms)</td>
        </tr>
    </tbody>
</table>

A few extra million rays per-second and a simpler implementation is pretty great for **RFO**!

However, **RFO** shares the same limitation of **OGCH**: since we no longer run the any hit shader,
we won't compute correct shadows when using alpha cut-out textures.
In this case I think it is still possible to skip making an occlusion hit group
and re-use the primary hit group (which would also implement an any hit shader to test against
the cut-out texture), and pass the accept first hit and skip closest hit ray flags. This will
result in the first valid hit returned by the any hit shader (which doesn't necessarily need to call
`AcceptHitAndEndSearch` or terminate ray) to be taken as the final hit and the closest hit shader
to be skipped. When I add support for alpha cut-out textures I'll test this idea out to see how well it works.
This would be the same as **OGAH** where we additionally specify the skip closest hit flag.

### Update 9/7

I've added an unshaded primary + shadow ray only benchmark, thanks
[Jacco Bikker](https://twitter.com/j_bikker/status/1170322992267780096) for the suggestion!
To compare how well these perform at higher resolutions (i.e. more primary rays) I've also
added an additional set of benchmarks run at 1440p. In the future I'll have to add an offline
benchmark app which can take some number of samples per-pixel and render at higher resolutions
than my monitor, which should give better benchmark results overall as well.

