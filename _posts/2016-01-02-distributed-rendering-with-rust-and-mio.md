---

published: true
layout: post
title: "Distributed Rendering with Rust and Mio"
description: ""
category:
tags: ["Rust", "ray tracing", "graphics", "animation", "distributed rendering"]

---
{% include JB/setup %}

In this post we'll take a look at adding distributed rendering to
[tray\_rust](https://github.com/Twinklebear/tray_rust) which will let us take advantage of multiple
machines when rendering an image, like a compute cluster.
To do this we'll look at options for how to distribute the rendering job across multiple nodes
and what sort of communication is needed synchronize their work. We'll also look into how we
can use [mio](https://github.com/carllerche/mio) to write an efficient master process that
can manage multiple workers effectively.

After implementing a simple technique to distribute the job we'll discuss
the scalability of this approach and possible paths forward to improve it. I've
also recently written a [plugin for Blender](https://github.com/Twinklebear/tray_rust_blender) so you can
easily create your own scenes and
will mention a bit on how to run the ray tracer on Google Compute Engine (or AWS EC2)
if you want to try out the distributed rendering yourself.

<!--more-->

# Distributing Work in a Ray Tracer

To motivate how to distribute the rendering job between nodes it's worth a short review
of how work is distributed between threads on a single machine.

## Work Distribution Between Threads

Since all the work
of tracing a ray through a pixel and into the scene is independent for each pixel a simple approach
is to split the image up into blocks, let's say 8x8, and assign these blocks
to different threads to render. We end up with a simple queue of blocks to be rendered and track the
next one to hand out with an atomic counter. When a thread wants a new block to render it just
increments the counter and fetches the next block, or sees that there are none left and exits. Choosing a
block size bigger than 1x1 (a single pixel) but not too big gives a nice trade off between load balancing
blocks and synchronization overhead when a thread gets its next block.
In an attempt to get some cache-coherence the block queue is sorted in
[Z-order](https://en.wikipedia.org/wiki/Z-order_curve) so it's more likely a thread will pick a
block closer to what it and other threads are working on, giving a higher chance the meshes
and other data for that region are already in cache.

<div class="col-md-12">
<div class="col-md-8 offset-md-2 text-md-center">
<pre class="diagram">
                +----------+----------+
                |          |          |
                |          |          |
   Given to --->+ block 0  | block 1  |<--- Given to
   thread 0     |        --+-.        |     thread 1
                |          |/         |
                +----------/----------+
                |         /|          |
                |        '-+--        |
 Next block --->| block 2  | block 3  |
 to give out    |          |          |
                |          |          |
                +----------+----------+
</pre>
<i>Distributing blocks in Z-order for a 16x16 image rendered with two threads.
Diagrams generated with <a href="http://casual-effects.com/markdeep/">Markeep</a>.</i>
</div>
</div>

Saving the sampled color data from a ray in this system is also relatively simple, but requires a bit of
synchronization to handle [reconstruction filtering](http://www.luxrender.net/wiki/LuxRender_Render_settings#Filter).
When using a reconstruction filter the sample
computed by a ray is written to multiple pixels, weighted by the filter weight at each pixel.
Threads must synchronize their writes since the blocks of pixels they're writing to are not disjoint even
though the blocks they're assigned are.
This synchronization is handled with a fine-grained locking scheme, where each 2x2 block of pixels
in the framebuffer is protected by a mutex that the thread must acquire before writing its samples to that
region of the framebuffer. Without reconstruction filtering threads never write to the same pixel since
their work regions are disjoint and we wouldn't need any synchronization, however the quality improvement
from reconstruction filtering is worth the added overhead.

> *Note:* A pixel in the framebuffer isn't an 8-bit RGB triple since we need
> the filter weight of each pixel accumulated from samples written to it.
> A pixel is four floats, an RGB triple and the accumulated filter weight.
> To save the image we divide the RGB components by the filter weight and convert to
> 8-bit sRGB. Without storing the floating point samples we wouldn't be able
> to correctly reconstruct the image when taking multiple samples per pixel and/or using reconstruction
> filtering.

## Extending to Multiple Machines

This image based work decomposition extends easily to distributing work across multiple
machines. Instead of having a single node work through the block queue we assign
subsets of it to different machines in our cluster, where they will distribute
their blocks to threads for rendering as before. By adding the reasonable
assumption that the scene data is on some shared filesystem or has already been uploaded to each
machine we can send a simple set of instructions to each worker. All we need to tell them
is where to find the scene file, which frames of the animation to render and what subset of blocks
they've been assigned.

Suppose we're rendering a 400x304 image of the scene "cornell\_box.json" with five
worker nodes. In total we have 1900 8x8 blocks to render and the master
will instruct each node to render 380 of them. In the case that
the number of nodes doesn't evenly divide the number of blocks the remainder are given to the
last worker.

<div class="col-md-12 text-md-center">
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
<i>Master sends instructions to the worker nodes</i>
</div>

### Combining Results from Workers

We're left with one small issue when combining results from our worker nodes, and it relates
to why we need store floating point sample data and deal with locking our framebuffer to synchronize it
between threads on a node. Although the regions assigned to workers are disjoint subsets of the
image the samples that their threads compute will overlap with neighboring nodes due to reconstruction
filtering. For example, if we use a 4x4 pixel filter each node
will write to its 8x8 blocks and +/- 2 pixels in each direction, overlapping with other worker's regions.

In our example rendering of the Cornell box the images below would be the results of each worker if
we just saved them out. If you zoom in a bit you can see there's some overlap between the regions written to by
each worker. The images are a bit noisy since they were rendered with just 256 samples per pixel.
Note that with the Mitchell-Netravali
filter used here some pixels are actually assigned negative weights so these won't show up properly in the
images below. Additionally, there may also be a bug causing the odd extra boxes at the corners of the worker's
results, I need to look into this some more.

<div class="row">
<div class="col-md-6 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/9UfVGse.png" alt="Node 0's results">
<i>Worker 0's Results</i>
</div>
<div class="col-md-6 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/1PrdC7N.png" alt="node 1's results">
<i>Worker 1's Results</i>
</div>
</div>

<div class="row">
<div class="col-md-4 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/NKXW7ap.png" alt="node 2's results">
<i>Worker 2's Results</i>
</div>

<div class="col-md-4 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/lF8jwRE.png" alt="node 3's results">
<i>Worker 3's Results</i>
</div>

<div class="col-md-4 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/Qz7yIyL.png" alt="node 4's results">
<i>Worker 4's Results</i>
</div>
</div>

Due to this overlap the master node needs to be able to properly combine pixels from multiple nodes.
This requires that each worker sends its pixels as the full float RGB triple and filter weight that
we mentioned earlier.

### Reducing Communication Overhead

Since most of the worker's framebuffer will be black as other nodes are assigned those regions there's no
reason to send the whole thing. This significantly reduces communication overhead, sending the full
framebuffer would significantly increase the data transferred as we added more nodes which will hurt scalability.
Consider rendering a 1920x1080 image: each node sends the master a RGBW float framebuffer
for a total of about 32MB per node. If we used 64 nodes to render this we'd send a total of about 2.05GB,
where only about 1.56% of each 32MB framebuffer sent by the workers has actually been written too!

Since the worker only writes to a small portion of the framebuffer we can just send the blocks that it's
actually written too.
For convenience I currently send blocks of the same size as the framebuffer locks, so each worker will send
a list of 2x2 blocks along with a list of where the blocks are in the image. This significantly reduces
communication overhead and provides the master with all the information it needs to place a worker's results
in the final framebuffer. This does add some overhead to each block: we send the x,y coordinates of the
block as unsigned 64-bit ints which adds a 16 byte header to each 2x2 block (64 bytes of pixel data) for
a 25% overhead per block.

We do still add some additional communication as we add more nodes since the regions that nodes
send back to the master overlap some based on the size of the reconstruction filter. We'll discuss
one idea for potentially reducing this overhead further in the scalability section.

<div class="col-md-12 text-md-center">
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
<i>Master collects rendering results from the workers and saves the image</i>
</div>

Once the master has collected results from all the workers it can do the final filter weight
division for each pixel and conversion to sRGB to save the frame out as a PNG. Here's the result
for our 400x304 Cornell box example with 256 samples per pixel that we've been following along.

<div class="col-md-12 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/YEhp254.png" alt="Rendered result">
<i>Rendered Image</i>
</div>

# Coordinating the Workers

The master node requires some more work to implement than the workers, it needs to manage
accepting data from multiple workers who are reporting different regions of (potentially different) frames
of the animation and combining these results. It also needs to track whether a frame has been completed and
can be saved out to disk. Additionally we'd like the master to be as lightweight as possible so it can
run on the same node as one of the workers and not take up too much CPU.

We'd also like to avoid requiring workers to open a new TCP connection each time they want to send
results to the master node. Having the master node listen on a TCP socket and behave as a blocking server
that accepts connections from workers and reads data from one at a time likely won't scale up very well.
What we'd really like is some kind of async event loop,
where the master can wait on data from multiple workers at the same time and read from them when they've
sent some data.

## Asynchronous I/O with mio

This is where [mio](https://github.com/carllerche/mio) comes in. Mio is a powerful low overhead I/O library
for Rust and most important for us, it provides abstractions for non-blocking TCP sockets and an event loop for
reading/writing based on whether they're readable/writable or not. Having never used non-blocking sockets
or event based I/O this took a bit of learning but has turned out very nice.

When constructing the master we can start a TCP connection to each worker,
who are all listening on the same port. The master is given the list of worker hostnames or IP addresses
specifying the worker nodes to contact. To identify the connection that an event was received on
mio allows you to specify a [Token](http://rustdoc.s3-website-us-east-1.amazonaws.com/mio/master/mio/struct.Token.html)
with a `usize`, we'll just use the worker's index in the list of workers.

{% highlight rust %}
// Loop through the list of workers and connect to them.
for (i, host) in workers.iter().enumerate() {
    // to_socket_addrs returns a Result<Iterator> of SocketAddrs, if we fail parsing
    // we should just abort so we use unwrap here.
    let addr = (&host[..], worker::PORT).to_socket_addrs().unwrap().next().unwrap();
    // Use mio's TcpStream to connect to the worker, if we succeed in starting the
    // connection add this stream to the event loop
    match TcpStream::connect(&addr) {
        Ok(stream) => {
            // Each worker is identified in the event loop by their index in the workers Vec
            match event_loop.register(&stream, Token(i), EventSet::all(), PollOpt::level()){
                Err(e) => panic!("Error registering stream from {}: {}", host, e),
                Ok(_) => {},
            }
            connections.push(stream);
        },
        Err(e) => panic!("Failed to contact worker {}: {:?}", host, e),
    }
}
{% endhighlight %}

After constructing the master we start running mio's event loop. Our Master struct implements the
[`mio::Handler`](http://rustdoc.s3-website-us-east-1.amazonaws.com/mio/master/mio/trait.Handler.html)
trait which requires we implement the `ready` method. This method is called by mio when an event
is ready to be handled on one of the TCP streams we registered with the event loop when constructing
the master.

{% highlight rust %}
impl Handler for Master {
    type Timeout = ();
    type Message = ();

    fn ready(&mut self, event_loop: &mut EventLoop<Master>, token: Token, event: EventSet) {
        let worker = token.as_usize();
        if event.is_writable() {
            // Send the worker their instructions and stop listening for writable events
        }
        if event.is_readable() {
            // Read frame data sent by the worker
        }
    }
}
{% endhighlight %}

The writable event handling isn't too interesting as we just send the worker their instructions
using blocking I/O. The instructions struct with the worker's instructions is encoded
using [bincode](https://github.com/TyOverby/bincode) and sent
with [write_all](http://doc.rust-lang.org/std/io/trait.Write.html#method.write_all). The readable
event handling is where the more interesting work of dealing with async writes from multiple workers is done.

## Reading From Multiple Workers Asynchronously

While we've reduced the communication overhead quite a bit the workers are still going to be sending
more data than we would get with a single call to
[read](http://doc.rust-lang.org/std/io/trait.Read.html#tymethod.read), if we wanted to read the
entire frame data sent by the worker immediately upon receiving a readable event we'd still need to
block. However blocking ruins the whole reason we've gone with mio and async I/O in the first place!
While we're stuck blocking on this worker there's incoming writes from other workers that we should
also be reading from.

The solution I've chosen here is to have a buffer for each worker that we write to each
time we get a new readable event, tracking how many bytes we've read so far and how many we expect to read
in total.
Each time we get a readable event on the worker we do a single `read` to get the bytes currently available
without blocking and place these in the buffer starting after the data we've read
previously. Once we've read all the bytes the worker is sending us (our data starts with an unsigned
64 bit int specifying the number sent) we can decode the frame with bincode.

### The Worker Buffer

A worker buffer is a partially read result from a worker, where we're still waiting on more bytes
from the network or TCP stack. It tracks how many bytes we're expecting to receive and how many we've
gotten so far so we know where to continue writing to the buffer and when we've got everything.

{% highlight rust %}
struct WorkerBuffer {
    pub buf: Vec<u8>,
    pub expected_size: usize,
    pub currently_read: usize,
}
impl WorkerBuffer {
    pub fn new() -> WorkerBuffer {
        // We start with an expected size of 8 since we expect a 64 bit uint header
        // telling us how many bytes are being sent
        WorkerBuffer { buf: Vec::new(), expected_size: 8, currently_read: 0 }
    }
}
{% endhighlight %}

The buffer stores a partially read `Frame` sent back by a worker to report its results. The `Frame` struct
begins with an 8 byte header specifying how many bytes it is when encoded with bincode.

{% highlight rust %}
struct Frame {
    pub encoded_size: u64,
    // Which frame the worker is sending its results for
    pub frame: usize,
    // Block size of the blocks being sent
    pub block_size: (usize, usize),
    // Starting locations of each block
    pub blocks: Vec<(usize, usize)>,
    // Sample data for each block, RGBW
    pub pixels: Vec<f32>,
}
{% endhighlight %}

### Reading into a Worker Buffer

When the master gets a readable event on a worker it adds the newly available bytes to the worker's buffer
and checks if it's read the entire `Frame`. This is handled by the `read_worker_buffer` method which returns
true if we've got all the data the worker is sending and can decode the frame. This code is best
explained inline with comments, so please see the snippet for details on how this works.

{% highlight rust %}
fn read_worker_buffer(&mut self, worker: usize) -> bool {
    let buf = &mut self.worker_buffers[worker];
    // If we haven't read the size of data being sent, read that now
    if buf.currently_read < 8 {
        // First 8 bytes are a u64 specifying the number of bytes being sent,
        // make sure we have room to store 8 bytes
        buf.buf.extend(iter::repeat(0u8).take(8));
        match self.connections[worker].read(&mut buf.buf[buf.currently_read..]) {
            Ok(n) => buf.currently_read += n,
            Err(e) => println!("Error reading results from worker {}: {}", self.workers[worker], e),
        }
        // Recall that our initial expected size is 8, for the size header.
        // Once we've read this we can decode the header and get the real size of the data.
        if buf.currently_read == buf.expected_size {
            buf.expected_size = decode(&buf.buf[..]).unwrap();
            // Extend the Vec so we've got room for the remaning bytes, minus 8 for the
            // size header we just read
            buf.buf.extend(iter::repeat(0u8).take(buf.expected_size - 8));
        }
    }
    // If we've finished reading the size header we can now start reading the frame data
    if buf.currently_read >= 8 {
        match self.connections[worker].read(&mut buf.buf[buf.currently_read..]) {
            Ok(n) => buf.currently_read += n,
            Err(e) => println!("Error reading results from worker {}: {}", self.workers[worker], e),
        }
    }
    // Return true if we've read all the data we're expecting
    buf.currently_read == buf.expected_size
}
{% endhighlight %}

In the master's event loop we call this function on readable events, passing the ID of the worker we're
reading from.
If we've read the all the data being sent by the worker we decode the frame
with bincode, accumulate its data into the combined frame and clean up to start
reading the next frame.

{% highlight rust %}
// Read results from the worker, if we've accumulated all the data being sent
// decode and accumulate the frame
if self.read_worker_buffer(worker) {
    let frame = decode(&self.worker_buffers[worker].buf[..]).unwrap();
    self.save_results(frame);
    // Clear the worker buffer for the next frame
    self.worker_buffers[worker].buf.clear();
    self.worker_buffers[worker].expected_size = 8;
    self.worker_buffers[worker].currently_read = 0;
}
{% endhighlight %}

### Handling Workers Reporting Different Frames

Due to differences in scene complexity or the worker node hardware some workers may
finish their assigned blocks faster or slower than others. The master node can't assume that once it starts
getting frame one from a worker that all workers have reported frame zero and it can be saved out. We need
to track how many workers have reported a frame as we accumulate results from them.
Only when all workers have reported their results for a frame can we save it out and mark it completed.

This is expressible very nicely with the enum type in Rust. A frame can either be in progress and we're
tracking how many workers have reported it and the image where we're accumulating results
or it's completed and has been saved out.

{% highlight rust %}
enum DistributedFrame {
    InProgress {
        // The number of workers who have reported results for this frame so far
        num_reporting: usize,
        // Where we're combining worker's results to form the final image
        render: Image,
    },
    Completed,
}

impl DistributedFrame {
    // Start accumulating results for a frame, we begin with no workers reporting
    pub fn start(img_dim: (usize, usize)) -> DistributedFrame {
        DistributedFrame::InProgress { num_reporting: 0, render: Image::new(img_dim) }
    }
}
{% endhighlight %}

The master stores a `HashMap<usize, DistributedFrame>` which maps frame numbers to distributed frames
so we can quickly look up a frame when we've
decoded one from a worker to accumulate its results into the final image. When we try to look up
a frame in the map there's two possibilities: the frame could be in the map (and is either `InProgress`
or `Completed`) or this worker is the first to report this frame and we must create the entry.

This operation is performed with the hash map
[`Entry`](http://doc.rust-lang.org/std/collections/hash_map/enum.Entry.html) API. It's important to note
that we use the `or_insert_with` method instead of just `or_insert` because starting a distributed frame
involves allocating a new image to store the result. By passing a function to call instead of a value to
insert we don't need to start a new distributed frame each time we look one up, just when we find that
it's not in the map.

{% highlight rust %}
let mut df = self.frames.entry(frame_num).or_insert_with(|| DistributedFrame::start(img_dim));
{% endhighlight %}

Next we handle the two cases of the entry existing in the map, either it's in progress and we can
accumulate the results from the worker or it's been marked completed and something has gone wrong.
If we've finished an in progress frame we save it to disk and mark that we've finished it by setting
it to `Completed` outside the match. A frame is determined to be completed if the number of workers
who've reported results for it is equal to the total number of workers.

{% highlight rust %}
let mut finished = false;
match df {
    &mut DistributedFrame::InProgress { ref mut num_reporting, ref mut render } => {
        // Collect results from the worker and see if we've finished the
        // frame and can save it
        render.add_blocks(frame.block_size, &frame.blocks, &frame.pixels);
        *num_reporting += 1;
        if *num_reporting == self.workers.len() {
            // This frame is done, save it out to a PNG
            finished = true;
        }
    },
    &mut DistributedFrame::Completed => println!("Worker reporting on completed frame {}?", frame_num),
}
// This is a bit awkward, since we borrow df in the match we can't mark it completed in there
if finished {
    *df = DistributedFrame::Completed;
}
{% endhighlight %}

A possible improvement here is to have the job of adding the worker's results to the distributed frame
be managed by a threadpool, or at least off load the work of saving the image to some
other threads. This would free up more time on the event loop for the master to read more data from
the workers, currently it will be busy for some time accumulating results from workers and saving
the images.

### Summary

Some of the details are bit involved but overall the distributed computation is not too complicated.
The work decomposition chosen allows us to get away without any communication between the workers,
they just need to know what part of the image they're rendering and who to send results back to. Since
we also assume that the scene data is available on each worker either through a shared file system
or by simplying being copied to each machine we don't have to worry about sending the models and such over
either. When the
worker launches it starts listening for the master on a hard-coded port number (63234). The master
is launched and passed the worker's hostnames or IP addresses and it
starts opening a TCP connection to each and enters mio's event loop.

Once a worker is writable (we've connected successfully) the master sends the worker its instructions
and stops watching for writable events on the connection. Upon recieving instructions the worker begins
rendering using the desired number of threads (defaults to number of logical cores). After finishing
its blocks for a frame the worker sends its results back to the master which is watching for readable events
on all the workers. Once the master has collected results from all the workers
for a frame it saves out the image and marks it completed. After the workers have finished their blocks
for the last frame being rendered they exit, once the master has saved out the last frame it also exits.

### Code

The full code for the distributed rendering is in tray\_rust's [exec::distrib](https://github.com/Twinklebear/tray_rust/tree/master/src/exec/distrib)
module if you're interested in some more details.

# Scalability

Now that we've implemented a distributed computation we'd like to know how well it scales as we add
more workers (strong scaling). For these tests I used two scenes: one is pretty simple with some minor
work imbalance which should reveal issues more related to communication overhead while the other scene
is very imbalanced and will test scaling issues in the presence of uneven work distribution.

The simpler scene is the classic Cornell box which we'll render at 800x600 resolution with
1024 samples per pixel using path tracing. The load imbalanced scene is the
[Stanford Buddha](http://graphics.stanford.edu/data/3Dscanrep/) placed inside the Cornell box,
this results in a few workers having a
complex model to deal with while the majority of them are just intersecting the walls. The Buddha
box is rendered at 1280x720 with 1024 samples per pixel using path tracing. Since we're using
path tracing it's likely that paths traced which initially hit a wall will bounce around the scene
and intersect the Buddha but the pixels that see it directly will still have more work
vs. those that hit it indirectly.

<div class="col-md-12 text-md-center">
<img class="img-fluid" src="http://i.imgur.com/usuLnIj.png" alt="Cornell Box">
<i>Cornell Box test scene</i>

<img class="img-fluid" src="http://i.imgur.com/hOZmzlB.png" alt="Buddha Box">
<i>Buddha Box test scene</i>
</div>

To run these scaling tests I used two clusters at my lab, one is a bit older which we'll refer to
as *old* while the newer machine we'll call *new*. The machine specifications are:

- *old:* 64 nodes, each with two [Xeon X5550](http://ark.intel.com/products/37106/Intel-Xeon-Processor-X5550-8M-Cache-2_66-GHz-6_40-GTs-Intel-QPI) CPUs.
This is a legacy machine though so a few nodes have failed and won't be repaired, combined with other users
running on the machine as well I was only able to get up to 44 nodes.

- *new:* 32 nodes, each with two [Xeon E5-2660](http://ark.intel.com/products/64584/Intel-Xeon-Processor-E5-2660-20M-Cache-2_20-GHz-8_00-GTs-Intel-QPI) CPUs.
Since some other users are running on
this machine (but not using many threads) I used just 30 threads/node since they had the remaining two.
This shouldn't change the speedup numbers though since our
baseline time (1x) is a single node with 30 threads. On this machine I tested up to 28 nodes as a few were
down or otherwise occupied.

These plots show speedup over a single node which is set as our baseline of 1x compared to perfect
strong scaling. In the case of perfect strong scaling we'd expect that if 1 node is 1x then 20 nodes
should run at 20x the speed, however this is quite hard to achieve.

<div class="col-md-12">
<div class="col-md-10 offset-md-1 text-md-center">
<img class="img-fluid" src="/assets/img/distrib_rendering_scaling/old_scaling.svg">
<i>Old cluster strong scaling, 16 threads/node</i>
</div>
<div class="col-md-10 offset-md-1 text-md-center">
<img class="img-fluid" src="/assets/img/distrib_rendering_scaling/new_scaling.svg">
<i>New cluster strong scaling, 30 threads/node</i>
</div>
</div>

On the *old* cluster for the Cornell box we see a speedup of 37.57x when using 44 nodes, for
the Buddha box we see only 30.53x. On the *new* cluster
for the Cornell box we get a speedup of 24.95x at 28 nodes while with the Buddha box we get
a speedup of just 18.91x. So why do we not scale as well as we'd hope, especially on the Buddha box?
I have two ideas on possible improvements to tray\_rust's scalability.

## Scaling Issue 1: Grouping Worker's Results

Currently we have a pretty large chunk of overhead when sending results back: for each 2x2 block of results
sent by a worker it includes an additional 16 byte header specifying the block's location, adding
a 25% size overhead to the block. This is most clearly seen in the Cornell box tests since its workload
is relatively balanced. We can see that it stays closer to perfect scaling for longer than the
Buddha box and when it starts to break down some (about 22 nodes on *old* and 16 on *new*) it doesn't drop
as fast. However it clearly is trailing off further from perfect scaling
as we get to higher node counts where we get less and less speedup for each additional node.

I think this is coming from an increased amount of data sent to the master as we add nodes.
Recall that when using reconstruction filtering nodes write to pixels in blocks assigned to
other nodes so neighbors will send some overlapping data. The amount of overlapping data grows as
we add more nodes since more nodes will overlap each other's regions. A possible solution is to
find the fewest number of bounding rectangles that contain the pixels the node has written to that will
minimize the amount of pixels and block headers we need to send.

This is mostly a strong hunch at the moment but will be cleared up by doing some scaling tests
on renders without reconstruction filtering. Without reconstruction filtering there will be no overlap
between regions that nodes write to so we can measure scaling without this issue of overlapping data.

## Scaling Issue 2: Work Stealing

The Buddha box scene performs even worse than the Cornell box scene, it starts to drop off at lower node
counts than the Cornell box and continues to fall behind in terms of added speedup per node. While the culprit
in the Cornell box scaling results I'm a bit less sure on, I'm pretty confident that a lack of load balancing
among the workers is what hurts the Buddha box scene's scaling the most.

When looking at some of the individual worker render times
for a 25 node run on *new* the fastest worker finished in 39.2s while the slowest
took 57.6s! In fact most nodes finished in about 39-42s while the few stuck with large portions of the Buddha
took 51-57s.
For about 22s we have workers finishing and exiting when they could actually be helping other workers still
rendering to finish faster.

The clear fix here is to implement some form of distributed work stealing to allow workers to look around
for more blocks to render once they finish their assigned blocks (minus any stolen from them). I don't
know anything about distributed work stealing and it sounds like a pretty complicated topic so I haven't
thought much about actually implementing this. It would be really awesome to try out though and should help
quite a bit with scalability, especially on imbalanced scenes.

## Scalability Cap

As a result of the block based work decomposition we chose in the beginning we're limited on how
many threads we can take advantage of. For the 400x304 Cornell box example we have 1900 8x8 blocks to
render, if we have more than 1900 cores available we can't take advantage of them as we simply have
no work to assign them. An easy fix here would be to detect this case and have the master
or workers subdivide the blocks to 4x4 or 2x2 to decompose the problem further so we can
assign these extra threads some work.

## Fault Tolerance

Another limitation of the current distributed rendering is that there is no fault tolerance. If a worker
goes down in the current system the master will detect the error and terminate, which will propagate the
termination to the remaining workers. For long runs especially at high node counts worker failures
are not that rare and a much better approach here would be to redistribute the failed worker's blocks.
I'm unsure if this is something I'll implement, in the presence of work stealing it would become even more
complex. For example we wouldn't want to re-assign blocks that were stolen from the worker before it crashed,
but determining which blocks were stolen might be tough.

# Try tray\_rust Yourself!

Recently I've put together a simple [Blender plugin](https://github.com/Twinklebear/tray_rust_blender)
for tray\_rust which will let you export static and keyframe animated scenes from Blender to a tray\_rust
scene. There are still quite a few limitations which you can see discussed on the Github page but most
of these aren't as difficult to work around compared to positioning objects by hand in a text file.
You'll still need to specify materials by hand in the scene file, this is documented in the
[materials](http://www.willusher.io/tray_rust/tray_rust/material/index.html) module but is still pretty
user unfriendly.
Definitely try it out, if you put together a scene I'd be really excited to see it so tweet any
renders to me on Twitter [@\_wusher](https://twitter.com/_wusher)!

Here's a neat one I put together using Blender's physics simulation by baking the simulation
to keyframes before exporting. If the video doesn't play
properly you can download it [here](http://sci.utah.edu/~will/rt/rust_logos.mp4). The Rust logo was
modeled by [Nylithius](http://blenderartists.org/forum/showthread.php?362836-Rust-language-3D-logo), many
of the models in the scene make use of measured material data from the
[MERL BRDF database](http://www.merl.com/brdf/). The animation was rendered with 28 nodes on *new*
using the distributed renderer with 1024 samples per pixel and took 03:44:02 to render.

<video class="img-fluid" src="http://sci.utah.edu/~will/rt/rust_logos.mp4" type="video/mp4" controls
	style="padding-top:16px;padding-bottom:16px;" preload="metadata" poster="http://i.imgur.com/KFRqLAo.png">
Sorry your browser doesn't support HTML5 video, but don't worry you can download the video
<a href="http://sci.utah.edu/~will/rt/rust_logos.mp4">here</a> and watch it locally.
</video>

If you'd like to try using the distributed renderer you can do so with any machines on a network, so
some desktops or laptops will work, or you can grab some compute instances from Google Compute Engine
or AWS EC2.
See the [exec::distrib](http://www.willusher.io/tray_rust/tray_rust/exec/distrib/index.html)
module documentation for more information on how to run the distributed render,
or run tray\_rust with `-h` for a shorter summary of options.

<script src="/assets/markdeep_modified_min.js"></script>

