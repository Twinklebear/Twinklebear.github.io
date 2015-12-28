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
<i>Rendered Image</i>
</div>

# Coordinating the Workers

- How the master coordinates with the worker nodes. How we deal with nodes potentially reporting
different frames at the same time, e.g. some nodes running faster/slower than others. Detecting
when work has finished, possibility

- How we use mio to let one thread handle all the workers with asynchronous I/O. Talk about the worker
tmp buffers, filling them, detecting when we've got a frame from a worker, saving frames out. Tracking
which frame the worker reported, etc.

- Can also discuss lack of fault handling here

The master node requires some more work to implement than the workers. The master needs to manage
accepting data from multiple workers who are reporting different regions of (potentially different) frames
of the sequence and combining these results. It also needs to track whether a frame has been completed and
can be saved out to disk. Additionally we'd like the master to be as lightweight as possible so it could
run on the same node as one of the workers and not take up much CPU time while being able to accept results
from multiple workers simultaneously. What we'd really like is some kind of async event loop, where the
master can accept data from multiple workers at the same time based on when they write some data.

We'd also like to avoid having to make workers open a new TCP connection each time they want to send
results to the master node. Having the master node listen on a TCP socket and behave as a blocking server
that accepts connections from workers and reads data from one worker at a time likely won't scale to many
workers reporting a lot of data simultaneously.

## Asynchronous I/O with mio

This is where [mio](https://github.com/carllerche/mio) comes in. Mio is a powerful low overhead I/O library
for Rust and, most important for us, it provides abstractions for non-blocking TCP sockets and an event loop for
reading/writing based on whether they're readable/writable or not. Having never used non-blocking sockets
or event based I/O this took a bit of learning but has turned out very nice.

Our master node can start out using mio to send instructions to the workers and read results from them
in the event loop. When constructing the master we can open a bunch of TCP connections to the workers,
who will all be listening on the same port. The master is given the list of worker hostnames or IP addresses
specifying the worker nodes. To identify the connection that an event was received on mio allows you to specify
a token of any type, we'll just use its index in the list of workers to identify each socket.

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
            // Each worker is identified in the event loop by their index in the vec
            match event_loop.register(&stream, Token(i), EventSet::all(), PollOpt::level()){
                Err(e) => println!("Error registering stream from {}: {}", host, e),
                Ok(_) => {},
            }
            connections.push(stream);
        },
        Err(e) => println!("Failed to contact worker {}: {:?}", host, e),
    }
}
{% endhighlight %}

After constructing the master we start running mio's event loop. Our Master struct implements the
[`mio::Handler`](http://rustdoc.s3-website-us-east-1.amazonaws.com/mio/master/mio/trait.Handler.html)
trait, which provides the `ready` method. This method is called by mio when an event
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

The writable event handling isn't too interesting as we just send the worker their instructions (which blocks
to render) using blocking I/O. The Instructions struct containing the worker's instructions is encoded
with [bincode](https://github.com/TyOverby/bincode) and sent
with [write_all](http://doc.rust-lang.org/std/io/trait.Write.html#method.write_all). The readable
event handling is where the real work of dealing with async writes from multiple workers is done.

## Reading From Multiple Workers Asynchronously

While we've reduced the communication overhead quite a bit the workers are still going to be sending
more data than we would get with a single call to
[read](http://doc.rust-lang.org/std/io/trait.Read.html#tymethod.read) so if we wanted to read the
entire frame data sent by the worker immediately upon receiving a readable event we'd still need to
block. However blocking ruins the whole reason we've gone with mio and async I/O in the first place!
While we're stuck blocking on this worker there's incoming writes from other workers that we should
also be reading from.

The solution that I've settled on for this is to have a buffer for each worker that we write too each
time we get a new readable event, tracking how many bytes we've read so far and how many we expect to read.
Each time we get a readable event on the worker we do a single `read` to get the bytes currently available
to read, without blocking for more and place these in the buffer starting after the data we've read
previously. Once we've read all the bytes the worker is sending us (our data starts with an unsigned
64 bit int specifying the number of bytes sent) we can decode the frame with bincode and accumulate it.

### The Worker Buffer

A worker buffer is a partially read result from a worker, where we're still waiting on more bytes to
come in from the network or TCP stack.

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
begins with this 8 byte header specifying how many bytes it is when encoded with bincode.

{% highlight rust %}
struct Frame {
    // Size header for binary I/O with bincode
    pub encoded_size: u64,
    // Which frame the worker is sending its results for
    pub frame: usize,
    // Block size of the blocks being sent
    pub block_size: (usize, usize),
    // Starting locations of each block
    pub blocks: Vec<(usize, usize)>,
    // Sample data for each block, RGBW_F32 (W = weight)
    pub pixels: Vec<f32>,
}
{% endhighlight %}

### Reading into a Worker Buffer

When the master gets a readable event on a worker it adds the newly available bytes to the worker's buffer
and checks if it's read the entire `Frame`. This is handled by the `read_worker_buffer` method, which returns
true if we've got all the data the worker is sending and can decode the frame. This code is best
explained inline with comments, so please see the snippet for details on how this works.

{% highlight rust %}
fn read_worker_buffer(&mut self, worker: usize) -> bool {
    let mut buf = &mut self.worker_buffers[worker];
    // If we haven't read the size of data being sent, read that now
    if buf.currently_read < 8 {
        // First 8 bytes are a u64 specifying the number of bytes being sent,
        // make sure we have room to store 8 bytes
        buf.buf.extend(iter::repeat(0u8).take(8));
        match self.connections[worker].read(&mut buf.buf[buf.currently_read..]) {
            Ok(n) => buf.currently_read += n,
            Err(e) => println!("Error reading results from worker {}: {}", self.workers[worker], e),
        }
        // Recall that our initial expected size is 8, for the size header
        // once we've read this we can decode the header and get the real size of the data.
        if buf.currently_read == buf.expected_size {
            // How many bytes we expect to get from the worker for a frame
            buf.expected_size = decode(&buf.buf[..]).unwrap();
            // Extend the Vec so we've got enough room for the remaning bytes, minus the 8 for the
            // encoded size header
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
    buf.currently_read == buf.expected_size
}
{% endhighlight %}

In our event loop we now call this function on readable events, passing the worker ID to read some
of the frame data. If we've read the full amount being sent by the worker we then decode the frame
with bincode, accumulate its data into the final frame the master stores and clean up to start
reading the next frame being sent.

{% highlight rust %}
// Read results from the worker, if we've accumulated all the data being sent
// decode and accumulate the frame
if self.read_worker_buffer(worker) {
    let frame: Frame = decode(&self.worker_buffers[worker].buf[..]).unwrap();
    self.save_results(frame);
    // Clean up the worker buffer for the next frame
    self.worker_buffers[worker].buf.clear();
    self.worker_buffers[worker].expected_size = 8;
    self.worker_buffers[worker].currently_read = 0;
}
{% endhighlight %}

### Handling Workers Reporting Different Frames

Due to differences in scene complexity of parts of the image or the machines themselves some workers may
finish their assigned blocks faster or slower than others. The master node can't assume that once it starts
getting frame one from a worker that all workers have reported frame zero and it can be saved out. We need
to track how many workers have reported a frame as we accumulate results from them to an in progress frame
and only once all workers have reported their results for the frame can we save it out and mark it completed.

This can be expressed Rust really nicely with the enum type. A frame can either be in progress and we're
tracking which frame it is, how many workers have reported it and the image where we're accumulating results
or it's completed and we aren't storing any extra data about it.

{% highlight rust %}
enum DistributedFrame {
    InProgress {
        // The number of workers who have reported results for this frame so far
        num_reporting: usize,
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
a frame in the map there's two possibilities: the frame could be in the map and is either `InProgress`
or `Completed`, or this worker is the first to report this frame and we must create the entry.

This operation is performed with the hash map
[`Entry`](http://doc.rust-lang.org/std/collections/hash_map/enum.Entry.html) API. It's important to note
that we use the `or_insert_with` method instead of just `or_insert` because starting a distributed frame
involves allocating a new image to store the result. By passing a function to call instead of a value to
insert we don't need to create a new frame each time we look up a frame, just when we find that it's actually
not in the map.

{% highlight rust %}
let mut df = self.frames.entry(frame_num).or_insert_with(|| DistributedFrame::start(img_dim));
{% endhighlight %}

# Strong Scaling and Discussion

- Scaling results on a few scenes and on mcp and wopr. Discussion of results, potential improvements?
Work stealing to fix work imbalance issues are possible improvements that would be really interesting
to explore. Methods for grouping the samples to be sent into bigger blocks vs. just doing 2x2 ones
to reduce communication overhead will also help scale.

- Quick wrap up, some info on how to run this yourself.

<script src="/assets/markdeep_modified.js"></script>

