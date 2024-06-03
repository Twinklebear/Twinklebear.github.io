---
layout: single
title: "Hardware Accelerated Video Encoding on the Raspberry Pi 4 on Ubuntu 20.04 64-bit"
date: 2020-11-15
category: general
tags: [python, raspberrypi]
url: /general/2020/11/15/hw-accel-encoding-rpi4

---

I recently picked up a Raspberry Pi 4 8GB model to use for some lightweight server tasks
on my home network. After setting up Pi-Hole, OpenVPN, Plex, and Samba,
I got curious about using it to re-encode some videos I had. The videos are on
an external drive being monitored by Plex and shared on the network by Samba,
and some are quite large since they're at a (likely unnecessarily) high bitrate.
Trimming them down would help save a bit of space, and gives me an excuse to
play around with Python, FFmpeg, and the Pi's hardware accelerated video encoder.
In this post, I'll cover how to get FFmpeg setup to use the Pi 4's video encoding
hardware on a 64-bit OS and the little encoding manager/dashboard, [FBED](https://github.com/Twinklebear/fbed),
that I put together to monitor the progress of the encoding tasks.

<!--more-->

# Setting up FFmpeg

Some initial searching about what encoder to pick in FFmpeg for hardware accelerated
encoding on the Raspberry Pi pointed me to the `h264_omx` encoder. Unfortunately,
if you try running this on a 64-bit OS you'll get errors that `libOMX_Core.so`
and `libOmxCore.so` weren't found. Even after installing `libomxil-bellagio-dev`
these continue to not be found, as this package provides different libraries
than the OMX ones being searched for. It's possible that making a symlink here
would work, but I didn't test that (it seems a bit iffy). However, it sounds
like the `h264_omx` encoder is [considered deprecated](https://github.com/raspberrypi/firmware/issues/1366#issuecomment-612902082)
and won't be supported on 64-bit OS's.

Instead, FFmpeg provides the `h264_v4l2m2m` for hardware accelerated encoding/decoding
which is supported on the Raspberry Pi 4 and a 64-bit OS. It seems like the v4l2m2m API
is the new API that folks are moving forward with. However, if you install ffmpeg from apt and use
the `h264_v4l2m2m` encoder, the results are not very good:

{{< numbered_fig
    src="https://cdn.willusher.io/img/WeWZzwW.webp"
    caption="Not quite what we're after."
>}}

The version of FFmpeg distributed in apt (4.2.4 at the time of writing) is missing some commits that
fix this issue, which didn't make it in until release 4.3. So we'll have to build from
source. First, we can grab the source for 4.3 from Github. Note: later releases are also fine,
4.3 was the latest at the time of writing.

```bash
git clone --depth 1 --branch release/4.3 git@github.com:FFmpeg/FFmpeg.git
```

Then follow the [build guide for Ubuntu](https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu).
Since this will replace your install of ffmpeg, you'll also want to setup the third party libraries
mentioned in the guide to get support for libx264/265 CPU encoding and any others you want.
As with the guide, I recommend not installing to `/bin/` to avoid conflicts with the system package manager.
Instead you can install to `~/bin/` as in the guide, or in the repo directory (as I do here),
and add the directory with the binaries for `ffmpeg` and `ffprobe` to your `$PATH`.
My configure command is below:

```bash
./configure --prefix=`pwd`/install \
    --enable-gpl \
    --enable-nonfree \
    --arch=aarch64 \
    --enable-libaom \
    --enable-libass \
    --enable-libfdk-aac \
    --enable-libfreetype \
    --enable-libmp3lame \
    --enable-libopus \
    --enable-libvorbis \
    --enable-libvpx \
    --enable-libx264 \
    --enable-libx265 \
    --enable-libxml2 \
    --enable-libwebp \
    --enable-libdrm
```

With FFmpeg 4.3 built and in our path, we can try again with the `h264_v4l2m2m` encoder.

```bash
ffmpeg -i video.mp4 -c:v h264_v4l2m2m -b:v 8M -c:a copy test.mp4
```

Now we get a correct video output, powered by hardware accelerated encoding!
Using the hardware encoder the Pi can encode this 1080p video at 53-60 FPS, compared to
just 8-10 FPS when using the libx264 CPU decoder.

{{< numbered_fig
    src="https://cdn.willusher.io/img/g7SE3eg.webp"
    caption="A properly encoded cow."
    >}}

# A Command Line Encoding Dashboard

With this running, I could now re-encode the set of videos I wanted to trim
down using the Pi's hardware encoder for better performance. While a
bash script would do, a lot of the files have spaces in the names
which makes it a bit of a pain in bash, and just running ffmpeg directly
doesn't give some information I'd like about the estimated
time left and progress so far. Instead, I decided to script
the batch conversion in Python using [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) and
put a basic command line UI on top of it using [urwid](http://urwid.org/).
The result is [FBED - FFmpeg Batch Encoding Dashboard](https://github.com/Twinklebear/fbed),
shown below.

{{< numbered_fig
    src="https://cdn.willusher.io/img/UPywbV8.webp"
    caption="The FFmpeg Batch Encoding Dashboard"
    >}}

FBED takes the number of parallel encodes to run and a list of files or directories
to encode, and will then encode them all using FFmpeg.
FBED can run multiple encodes in parallel by running multiple FFmpeg subprocesses,
if the hardware can support it. On the RPi4 I didn't observe much overall speed-up
running two 1080p encodes in parallel to each other compared to a single one,
though have gotten speed-ups for parallel encodes on lower resolution videos.

```text
Usage:
    ./fbed.py <parallel_encodes> <items>...

Guide:
    <items> can be a single files or a directories. If a directory is passed all
    files in the directory and it subdirectories besides those in one named
    'encode_output' will be re-encoded
```

## Configuring FBED

FBED has a few settings hard-coded in it that I found to work well for my use case.
The script will pick the output target bitrate based on the video resolution, which you
can increase or decrease as desired by editing [the script](https://github.com/Twinklebear/fbed/blob/main/fbed.py#L52-L57):

```python
# Pick bitrate based on resolution, 1080p (8Mbps), 720p (5Mbps), smaller (3Mbps)
bitrate = "3M"
if info["height"] > 720:
    bitrate = "8M"
elif info["height"] > 480:
    bitrate = "5M"
```

You can also change the encoder used to select a different hardware encoder (e.g., `h264_nvenc` on Nvidia GPUs,
`h264_qsv` on Intel GPUs, etc.) by changing the value of `c:v` in the [`encoding_args`](https://github.com/Twinklebear/fbed/blob/main/fbed.py#L58-L67)
to your desired encoder. You can also pass additional arguments to the encoder by adding them here.
If you're on the RPi4 using `h264_v4l2m2m` I recommend leaving the `num_output_buffers` and
`num_capture_buffers` as I've set them, which raises their values above the defaults of 16 and 4 respectively.
When running parallel encodes of 720p and smaller videos I would get warnings from ffmpeg that the
capture buffers where flushed out to user space, and to consider increasing them. These are set
high enough that I don't seem to get these warnings, though will cause the memory capacity of the encoder to
be exceeded if trying to do multiple 1080p streams in parallel. In that case you'd want to set them to half their current value (i.e.,
to 16 and 8 respectively). Do not modify or remove the `progress` parameter, as this is required by the dashboard
to get progress information from FFmpeg, discussed below.

```python
encoding_args = {
    # HWAccel for RPi4, may need to pick a different encoder
    # for HW accel on other systems
    "c:v": "h264_v4l2m2m",
    "num_output_buffers": 32,
    "num_capture_buffers": 16,
    "b:v": bitrate,
    "c:a": "copy",
    "progress": f"pipe:{self.pipe_write}"
}
```

## Monitoring FFmpeg's Progress

The aspect of FBED that's probably most interesting to other folks writing scripts using FFmpeg
is how the progress monitoring works. This is done using FFmpeg's [`-progress`](https://ffmpeg.org/ffmpeg.html#Main-options)
argument which has FFmpeg output program-friendly progress information. An example of this
output is shown below.
The Python script gets this output by opening a pipe with `os.pipe()` and
passing the write end of this pipe to the FFmpeg subprocess. The script then
reads from the read end of the pipe every second to get the latest progress message to update the UI.

```text
fps=104.59
stream_0_0_q=15.0
bitrate=4305.6kbits/s
total_size=6291504
out_time_us=11690000
out_time_ms=11690000
out_time=00:00:11.690000
dup_frames=0
drop_frames=0
speed=4.48x
progress=continue
```

The output we need for monitoring progress for the dashboard are `out_time` and `speed`.
The `out_time` is the current
time point in the video that FFmpeg is encoding, `speed` is how fast relative to regular playback
FFmpeg is encoding the video. For example, 1x means FFmpeg is encoding the video just
as fast as it would be played back, meaning a 1 hour video will take 1 hour to encode.
A speed of 2x means the 1 hour video would take 30 minutes to encode, and 0.5x means
it would take 2 hours.

Once we know the current time point FFmpeg has reached (`out_time`)
and total length of the video we can compute the percentage of the video FFmpeg has
finished so far to display a progress bar:

```python
progress = (100.0 * out_time.total_seconds()) / video_duration.total_seconds()
```

Since we also know how fast FFmpeg is encoding the video relative to regular playback
speed, we can estimate how much longer it will take until the encoding is finished:

```python
remaining_time = (video_duration - out_time) / speed
```

# Conclusion

FBED was a fun weekend project for my Raspberry Pi 4 and I'm impressed with
the video hardware's encoding performance! While I could have just
run FFmpeg manually to encode the videos I wanted to re-encode in less
time, it certainly wouldn't have been as fun.
It's also pretty easy to configure FBED to pick a different encoder
to take advantage of different machine's capabilities, so it could
come in handy in other server encoding environments as a dashboard for FFmpeg.
The code is available on [Github](https://github.com/Twinklebear/fbed),
so check it out and let me know if you find it useful!

