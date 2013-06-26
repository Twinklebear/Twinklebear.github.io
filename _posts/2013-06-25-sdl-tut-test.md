---
layout: post
title: "SDL Tut Test"
description: "Testing out using this for my tuts"
category: "SDL 2 Tutorial Series"
tags: ["SDL 2 tutorial"]
---
{% include JB/setup %}

I'm curious how using github pages for a general programming blog/the sdl tutorials will feel, so this is a trial run
of doing the hello world lesson, [Lesson 1](http://twinklebeardev.blogspot.com/2012/07/lesson-1-hello-world.html).

<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson1/hello.bmp">
	<img class="centered" width="400" height="300" 
		src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson1/hello.bmp">
	</img>
</a>
Right click and save the image or click to download it directly from the Github repository.

### Starting SDL
Before we can start drawing cool stuff we'll need to initialize SDL and make sure it went ok. This is done with
[`SDL_Init`](http://wiki.libsdl.org/moin.fcg/SDL_Init), which takes [various flags](http://wiki.libsdl.org/moin.fcg/SDL_Init#Remarks)
of what to init and will return -1 upon failure. We'll want to print out what went wrong if we have an error so that we can try and fix it, 
so lets make use of [`SDL_GetError`](http://wiki.libsdl.org/moin.fcg/SDL_GetError) as well.
{% highlight c++ %}
if (SDL_Init(SDL_INIT_EVERYTHING) == -1){
    std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
    return -1;
}
{% endhighlight %}
<br />

### Opening the Window
Now that SDL is running we can open up a window with [`SDL_CreateWindow`](http://wiki.libsdl.org/moin.fcg/SDL_CreateWindow). 
This returns an `SDL_Window*`, or `NULL` if it failed.
We can specify the width, height and location of the window along with some [flags](http://wiki.libsdl.org/moin.fcg/SDL_WindowFlags)
for the window's properites. We'll want the window to be visible so we'll specify `SDL_WINDOW_SHOWN`.
{% highlight c++ %}
SDL_Window *win = SDL_CreateWindow("Hello world!", 100, 100, 640, 480, SDL_WINDOW_SHOWN);
//Be sure to check for errors!
if (win == NULL){
    std::cout << "SDL_CreateWindow error: " << SDL_GetError() << std::endl;
    return -1;
}
{% endhighlight %}
<br />

### Creating a Rendering Context
We then want to create a hardware-accelerated rendering context associated with the window so that we can use the system's 
GPU to draw things. This is done with calling [`SDL_CreateRenderer`](http://wiki.libsdl.org/moin.fcg/SDL_CreateRenderer)
with the flag `SDL_RENDERER_ACCELERATED`. Other available renderer flags are listed in the [wiki](http://wiki.libsdl.org/moin.fcg/SDL_RendererFlags).
This returns a `SDL_Renderer*` that we can then use to draw things. Similar to `SDL_CreateWindow` this function will return NULL upon failure.
{% highlight c++ %}
SDL_Renderer *ren = SDL_CreateRenderer(win, -1, SDL_RENDERER_ACCELERATED);
if (ren == NULL){
    std::cout << "SDL_CreateRenderer error: " << SDL_GetError() << std::endl;
    return -1;
}
{% endhighlight %}
<br />

### Loading the Texture
With our window and rendering context setup, the next thing to do is load our image, convert it to a 
[SDL_Texture](http://wiki.libsdl.org/moin.fcg/SDL_Texture) and then draw it!
We can load the image using [`SDL_LoadBMP`](http://wiki.libsdl.org/moin.fcg/SDL_LoadBMP) which will return a 
[`SDL_Surface*`](http://wiki.libsdl.org/moin.fcg/SDL_Surface) which we can then create a texture from.
{% highlight c++ %}
//Update the resource path as appropriate for your folder structure
SDL_Surface *bmp = SDL_LoadBMP("../res/Lesson1/hello.bmp");
if (bmp == NULL){
    std::cout << "SDL_LoadBMP error: " << SDL_GetError() << std::endl;
    return -1;
}
{% endhighlight %}
<br />

Because the `SDL_Surface` is for software rendering we need to load a texture from the image in memory. This is done with the 
[`SDL_CreateTextureFromSurface`](http://wiki.libsdl.org/moin.fcg/SDL_CreateTextureFromSurface)
function, which takes an `SDL_Surface*` corresponding to the loaded image to make the texture from.
We also need to the rendering context that the texture will be used in, so that the renderer will have access to the data.
{% highlight c++ %}
SDL_Texture *tex = SDL_CreateTextureFromSurface(ren, bmp);
if (tex == NULL){
    std::cout << "SDL_CreateTextureFromSurface error: " << SDL_GetError() << std::endl;
    return -1;
}
//We don't need the surface anymore so we can free it
SDL_FreeSurface(bmp);
{% endhighlight %}
<br />

### Drawing the Texture
The final step is to get our texture on the screen. To do this we'll clear the renderer, then render a copy of the texture to
fill the whole window, and present the updated rendering context to the window. We'll also have the program wait a few seconds
before exiting so we can see the product of our hard work.
{% highlight c++ %}
SDL_RenderClear(ren);
SDL_RenderCopy(ren, tex, NULL, NULL);
SDL_RenderPresent(ren);

SDL_Delay(2000);
{% endhighlight %}
<br />

### Cleaning Up
Before we exit the program we need to free our various SDL structures and exit SDL.
{% highlight c++ %}
SDL_DestroyTexture(tex);
SDL_DestroyRenderer(ren);
SDL_DestroyWindow(win);
SDL_Quit();
{% endhighlight %}
<br />

If everything went well you should see the hello world image display on a 640x480 window, wait for 2s and then exit.
Feel free to post in the comments if you run into any issues or have other questions. See you again in lesson 2!

