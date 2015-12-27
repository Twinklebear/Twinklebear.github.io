---

published: false
layout: post
title: "Distributed Rendering with Rust and Mio"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation", "distributed rendering"]

---
{% include JB/setup %}

In this post we'll take a look at adding distributed rendering to
[tray\_rust](https://github.com/Twinklebear/tray_rust) which will let us take advantage of multiple
machines when rendering an image. To avoid some confusion I don't mean
[distribution ray tracing](https://en.wikipedia.org/wiki/Distributed_ray_tracing) (which is often
called distributed ray tracing), instead we'll be looking at the distributed computing sense of the
word, where multiple machines collaborate on a computation (ray tracing in this case).

To do this we'll look at options for how to distribute the rendering job across multiple machines
and what sort of communication is needed synchronize their work. We'll also look into how we
can use [mio](https://github.com/carllerche/mio) to write an efficient master process that
can read results from multiple workers.

After implementing a simple approach to distribute the job and manage the workers we'll also discuss
strong scaling results of this approach and possible paths forward to improve scalability.

<!--more-->

# Distributing Work in a Ray Tracer

- Options for splitting up work in a distributed renderer. Maybe some discussion on data
parallel (distributed data) and how it differs from what I do (replicated data). It's worth
mentioning this is **not** distribution ray tracing (sometimes referred to as distributed, like in
the original paper by Cook et al.), which is entirely different. Unfortunately
the term is a bit overloaded. I mean distributed ray tracing in a distributed computing sense.

- Details on the block level distribution, advantages and limitations. Discuss issues with
reconstruction filtering and blocks overlapping each other. Discuss paralellism cap, we can't take
advantage of more threads than there are blocks with this system so we peak out at some point
since we don't have work stealing and don't adjust the block size to be finer.

To motivate my choice for distributing the rendering job between nodes it's worth a short review
of how work is distributed between threads on a single node in the renderer.

## Work Distribution Between Threads

Since all the work
of tracing a ray through a pixel and into the scene is independent for each pixel a simple approach
is to split the image up into blocks, e.g. 8x8 which is what I currently use, and assign these blocks
to different threads to render. We end up with a simple queue of blocks to be rendered and track the
next one to hand out with an atomic counter. Then when a thread wants a new block to render it just
increments the counter and fetches the next block, or sees that there are none left to render and exits.
In an attempt to get some cache-coherence of the data being rendered the block queue is sorted in
[Z-order](https://en.wikipedia.org/wiki/Z-order_curve) so it's more likely a thread will pick a
block near to what it and other threads are working on.

Saving the sampled color data from a ray in this system is also relatively simple, but requires a bit of
synchronization in the case of reconstruction filtering. When using a reconstruction filter the sample
computed by a ray is written to multiple pixels, weighted by the filter weight at the pixel. In this case
threads needs to synchronize their writes since the blocks of pixels they're writing to are no longer
disjoint. This synchronization is handled with a fine-grained locking scheme, where each 2x2 block of pixels
in the framebuffer is protected by a mutex that the thread must acquire before writing its samples to that
region of the framebuffer. Without reconstruction filtering threads never write to the same pixel since
their work regions are disjoint and we wouldn't need any synchronization here. The quality improvement
from reconstruction filtering is worth the cost though.

> **TODO: Make shorter? Feels long for a note**
> *Note:* A pixel in our framebuffer does not store an 8-bit RGB color value as you may expect, since we need
> to
> track the filter weight of each sample as we accumulate results from rays sent into the scene.
> Instead a pixel is a four floats, three for RGB components and a fourth for the accumulated filter weight.
> When we want to save the final image we divide the RGB components by the filter weight and convert to
> 8 bit sRGB. Without storing the floating point samples until we finish rendering we wouldn't be able
> to accurately reconstruct the image when taking multiple samples per pixel and/or using reconstruction
> filtering.

## Extending to Multiple Machines

This image based work decomposition extends relatively easily to distributing work across multiple
machines. Instead of having a single node work through the queue of blocks to be rendered we assign
subsets of this queue to the different machines in our cluster, where they will locally distribute
their blocks to threads on the machine for rendering in the same method as before. By adding a reasonable
assumption that the scene data is on some shared filesystem or has been already uploaded to each
machine we can send a relatively simple set of instructions to each worker. All we need to tell them
is where to load the scene file, which frames of the animation to render and what subset of blocks
they've been assigned.

Suppose we're rendering a 400x304 pixel image of the scene "cornell\_box.json" with five
worker nodes. In total we have 1900 8x8 pixel blocks to render for the complete image and the master
will instruct each node to render a subset of 380 of those blocks, as shown below.

<pre class="diagram">
       .-------------------------.      .---------.       .-------------------------.           
      | Scene: "cornell_box.json" |     |         |      | Scene: "cornell_box.json" |          
      | Frames: (0, 0)            |     | Master  |      | Frames: (0, 0)            |          
      | Block Start: 0            |     +---------+      | Block Start: 1520         |          
      | Block Count: 380          |    /// ----- \\\     | Block Count: 380          |          
       '-----------+-------------'    '--+-+-+-+-+--'     '--------+----------------'           
                   |                     | | | | |                 |
              .----o--------------------'  | | |  '----------------o--------.           
             |                .-----------'  |  '-----------.                |          
             |               |               |               |               |          
             v               v               v               v               v          
         .---+----.      .---+----.      .---+----.      .---+----.      .---+----.     
        /        /|     /        /|     /        /|     /        /|     /        /|     
       +--------+/|    +--------+/|    +--------+/|    +--------+/|    +--------+/|     
       |        +/|    |        +/|    |        +/|    |        +/|    |        +/|     
       | Worker +/|    | Worker +/|    | Worker +/|    | Worker +/|    | Worker +/|     
       | node 0 +/|    | node 1 +/|    | node 2 +/|    | node 3 +/|    | node 4 +/|     
       |        +/     |        +/     |        +/     |        +/     |        +/      
       '--------'      '--------'      '--------'      '--------'      '--------'       
</pre>

### Combining Results from Workers

We're left with one small issue when combining results from our worker nodes, and it relates
to why we need store floating point sample data and deal with locking our framebuffer to synchronize it
locally with threads on a node. Although the regions assigned to workers are disjoint subsets of the
image the samples that their threads compute will overlap with neighboring nodes due to reconstruction
filtering. Continuing with the 400x304 example Cornell box render, if we use a 4x4 pixel filter each node
will write to its 8x8 block of pixels +/- 2 pixels in each direction. Note that with the Mitchell-Netravali
filter some pixels we actually be assigned negative weights so these won't show up properly in the
images below. Additionally, there may also be a bug causing the odd extra box at the corners of the worker's
results but I need to look into this some more.

In our distributed rendering of the Cornell box these would be the results of each worker if we just saved them
out as an sRGB image. Note that if you zoom in there is some overlap between the regions written to by
each worker node. The images shown are a bit noisy since these were rendered with just 256 samples per pixel
for a simple example.

<div class="row">
<div class="col-md-6 text-center">
<img class="img-responsive" src="http://i.imgur.com/9UfVGse.png" alt="Node 0's results"></img>
<i>Worker 0's Results</i>
</div>
<div class="col-md-6 text-center">
<img class="img-responsive" src="http://i.imgur.com/1PrdC7N.png" alt="node 1's results"></img>
<i>Worker 1's Results</i>
</div>
</div>

<div class="row">
<div class="col-md-4 text-center">
<img class="img-responsive" src="http://i.imgur.com/NKXW7ap.png" alt="node 2's results"></img>
<i>Worker 2's Results</i>
</div>

<div class="col-md-4 text-center">
<img class="img-responsive" src="http://i.imgur.com/lF8jwRE.png" alt="node 3's results"></img>
<i>Worker 3's Results</i>
</div>

<div class="col-md-4 text-center">
<img class="img-responsive" src="http://i.imgur.com/Qz7yIyL.png" alt="node 4's results"></img>
<i>Worker 4's Results</i>
</div>
</div>

Due to this overlap the master node needs to be able to properly combine pixel samples from multiple nodes and
account for the filtering weight of each sample sent. To produce a correct image at the end each worker must
send its filtered results in floating point, including the weight for the pixel. Each pixel a worker sends
us will be the same pixel value we saw before, an RGB triple plus a weight stored in floating point.

### Reducing Communication Overhead

Since most of the worker's framebuffer will be black as other nodes are assigned those regions there's no
reason to send the whole thing. This significantly reduces communication overhead, if we sent the full
framebuffer we would increase the data sent as we added more nodes which will hurt scalability quite a bit,
and most of the data is actually not needed.
Consider rendering a 1920x1080 image: each node sends the master a RGBW float framebuffer
for a total of about 32MB per node. If we used 64 nodes to render this we'd send a total of about 2.05GB,
where only about 1.56% of the 32MB framebuffer sent by each worker have actually been written too!

To address this we can instead just send blocks of the framebuffer that the worker has actually written too.
For convenience I currently send blocks of the same size as the framebuffer locks, so each worker will send
a list of 2x2 blocks along with a list of where the blocks are in the image. This significantly reduces
communication overhead and provides the master with all the information it needs to place a worker's results
in the final framebuffer. This does add some overhead to each block, I send the x,y coordinates of the
block as unsigned 64-bit ints which adds a 16 byte header to each 2x2 block (64 bytes of pixel data) for
a 25% overhead per block.

We also still add some additional communication as we add more nodes since the result regions that nodes
send back to the master overlap some based on the size of the reconstruction filter. A potentially better
solution to minimize communication overhead would be to pick adjustable block sizes where we find the
biggest bounding rectangles around regions that the worker has written to. This would allow us to send
much larger blocks for regions where the worker's assigned blocks overlap while not sending many
pixels that the worker didn't write too.

<pre class="diagram">
        .--------.      .--------.      .--------.      .--------.      .--------.     
       /        /|     /        /|     /        /|     /        /|     /        /|     
      +--------+/|    +--------+/|    +--------+/|    +--------+/|    +--------+/|     
      |        +/|    |        +/|    |        +/|    |        +/|    |        +/|     
      | Worker +/|    | Worker +/|    | Worker +/|    | Worker +/|    | Worker +/|     
      | node 0 +/|    | node 1 +/|    | node 2 +/|    | node 3 +/|    | node 4 +/|     
      |        +/     |        +/     |        +/     |        +/     |        +/      
      '----+---'      '----+---'      '----+---'      '----+---'      '----+---'       
           |               |               |               |               |           
           |               |               |               |               |           
           |               |               |               |               |           
           |                '----------.   |   .----------'                |           
            '---------o--------------.  |  |  |  .------------------------'            
                      |               | |  |  | |                                      
   .------------------+---------.     v v  v  v v                                      
  | Frame: 0                     |    .---------.                                      
  | Block Size: (2, 2)           |    |         |                                      
  | Blocks: [(0, 0), (1, 0),...] |    | Master  |                                      
  | Pixels: [8.2, 7.6, 2, 9,...] |    +---------+                                      
   '----------------------------'    /// ----- \\\                                     
                                    '------+------'                                    
                                           |                                           
                                           v                                           
                                     +-----------+                                     
                                     | Rendered  |                                     
                                     |  Image    |                                     
                                     +-----------+                                     
</pre>

Once the master has collected results from all the workers it can do the final filter weight
division for each pixel and conversion to sRGB to save the frame out as a PNG. The result is a bit
noisy as this image was rendered with just 256 samples per pixel.

<div class="col-md-12 text-center">
<img class="img-responsive" src="http://i.imgur.com/YEhp254.png" alt="Rendered result"></img>
<i>Rendered Result</i>
</div>

# Coordinating the Workers

- How the master coordinates with the worker nodes. How instructions are sent, how rendered results
are sent back and how we deal with nodes potentially reporting different frames at the same time,
e.g. some nodes running faster/slower than others.

- How we use mio to let one thread handle all the workers with asynchronous I/O. Talk about the worker
tmp buffers, filling them, detecting when we've got a frame from a worker, saving frames out. Tracking
which frame the worker reported, etc.

# Strong Scaling and Discussion

- Scaling results on a few scenes and on mcp and wopr. Discussion of results, potential improvements?
Work stealing to fix work imbalance issues are possible improvements that would be really interesting
to explore. Methods for grouping the samples to be sent into bigger blocks vs. just doing 2x2 ones
to reduce communication overhead will also help scale.

- Quick wrap up, some info on how to run this yourself.

<script src="/assets/markdeep_modified.js"></script>

