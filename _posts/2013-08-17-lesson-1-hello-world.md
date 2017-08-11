---
layout: sdl_lesson
title: "Lesson 1: Hello World"
description: "Drawing Our First Image"
category: "SDL2 Tutorials" 
tags: ["SDL2"]
---
{% include JB/setup %}

In this lesson we'll learn how to open a window, create a rendering context and draw
an image we've loaded to the screen. Grab the BMP we'll be drawing below and save it somewhere in your
project and let's get started!

<!--more-->

<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson1/hello.bmp">
	<img class="centered" width="400" height="auto" 
		src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson1/hello.bmp">
</a>

Starting SDL
-
To use SDL we first need to initialize the various SDL subsystems we want to use. This is done through
[`SDL_Init`](http://wiki.libsdl.org/moin.fcg/SDL_Init) which takes a set of 
[flags](http://wiki.libsdl.org/moin.fcg/SDL_Init#Remarks) or'd together specifying the subsystems we'd like to initialize.
For now we just need the video subsystem but we'll add more flags as we require more features. Note that the event
handling system is initialized automatically when the video system is if not explicitly requested by itself while
the file I/O and threading systems are initialized by default.
If everything goes ok `SDL_Init` will return 0, if not we'll want to print out the error and quit.

{% highlight c++ %}
if (SDL_Init(SDL_INIT_VIDEO) != 0){
	std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
	return 1;
}
{% endhighlight %}
<br />

Opening a Window
-
We'll need a window to display our render in, we can create one with 
[`SDL_CreateWindow`](http://wiki.libsdl.org/moin.fcg/SDL_CreateWindow) which takes a title for the window,
the x and y position to create it at, the window width and height and some [flags](http://wiki.libsdl.org/moin.fcg/SDL_WindowFlags) to set properties of the window and returns an `SDL_Window*`. This pointer will be `NULL` if anything went
wrong when creating the window. If an error does occur we need to clean up SDL before exiting the program.

{% highlight c++ %}
SDL_Window *win = SDL_CreateWindow("Hello World!", 100, 100, 640, 480, SDL_WINDOW_SHOWN);
if (win == nullptr){
	std::cout << "SDL_CreateWindow Error: " << SDL_GetError() << std::endl;
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

Creating a Renderer
-
Now we can create a renderer to draw to the window using [`SDL_CreateRenderer`](http://wiki.libsdl.org/moin.fcg/SDL_CreateRenderer). This function takes the window to associate the renderer with, the index of the rendering driver
to be used (or -1 to select the first that meets our requirements) and various 
[flags](http://wiki.libsdl.org/moin.fcg/SDL_RendererFlags) used to specify what sort of renderer we want.
Here we're requesting a hardware accelerated renderer with vsync enabled. We'll get back an `SDL_Renderer*` which will be
`NULL` if something went wrong. If an error does occur we need to clean up anything we've previously created and quit
SDL before exiting the program.

{% highlight c++ %}
SDL_Renderer *ren = SDL_CreateRenderer(win, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
if (ren == nullptr){
	SDL_DestroyWindow(win);
	std::cout << "SDL_CreateRenderer Error: " << SDL_GetError() << std::endl;
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

Loading a Bitmap Image
-
To render a BMP image we'll need to load it into memory and then onto the rendering platform we're 
using (in this case the GPU). We can load the image with [`SDL_LoadBMP`](http://wiki.libsdl.org/moin.fcg/SDL_LoadBMP)
which gives us back a [`SDL_Surface*`](http://wiki.libsdl.org/moin.fcg/SDL_Surface) that we can then take and upload to a [`SDL_Texture`](http://wiki.libsdl.org/moin.fcg/SDL_Texture) that the renderer is able to use.

SDL_LoadBMP takes the filepath of our image, which you should change to match your project structure, and gives us back
an `SDL_Surface*` or `NULL` if something went wrong.

{% highlight c++ %}
std::string imagePath = getResourcePath("Lesson1") + "hello.bmp";
SDL_Surface *bmp = SDL_LoadBMP(imagePath.c_str());
if (bmp == nullptr){
	SDL_DestroyRenderer(ren);
	SDL_DestroyWindow(win);
	std::cout << "SDL_LoadBMP Error: " << SDL_GetError() << std::endl;
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

With the image loaded we can now upload it to the renderer using [`SDL_CreateTextureFromSurface`](http://wiki.libsdl.org/moin.fcg/SDL_CreateTextureFromSurface). We pass in the rendering context to upload to and the image in memory (the `SDL_Surface`)
and get back the loaded texture, if something went wrong we'll get back `NULL`. We're also done with the original
surface at this point so we'll free it now.

{% highlight c++ %}
SDL_Texture *tex = SDL_CreateTextureFromSurface(ren, bmp);
SDL_FreeSurface(bmp);
if (tex == nullptr){
	SDL_DestroyRenderer(ren);
	SDL_DestroyWindow(win);
	std::cout << "SDL_CreateTextureFromSurface Error: " << SDL_GetError() << std::endl;
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

Drawing the Texture
-
All that's left to do is get our texture on the screen! First we'll [clear](http://wiki.libsdl.org/moin.fcg/SDL_RenderClear)
the renderer, then [render our texture](http://wiki.libsdl.org/moin.fcg/SDL_RenderCopy) and then 
[present](http://wiki.libsdl.org/moin.fcg/SDL_RenderPresent) the updated screen to show the result. Since
we want to render the whole image and have it stretch to fill the screen we'll pass `NULL` as the source
and destination rectangles for `SDL_RenderCopy`. We'll also
want to keep the window open for a bit so we can see the result before the program exits, so we'll add in a call
to [`SDL_Delay`](http://wiki.libsdl.org/moin.fcg/SDL_Delay).

We'll place all this rendering code within the main loop of our program, which for now will be a simple for loop.
Each iteration through our loop we'll sleep for a second, so we can increase or decrease the counter to make our
program run for a longer or shorter period. When we get to event handling we'll instead track a boolean that indicates
if the user wants to quit our program (eg. clicked the X on the window) and exit our loop in that case.

{% highlight c++ %}
//A sleepy rendering loop, wait for 3 seconds and render and present the screen each time
for (int i = 0; i < 3; ++i){
	//First clear the renderer
	SDL_RenderClear(ren);
	//Draw the texture
	SDL_RenderCopy(ren, tex, NULL, NULL);
	//Update the screen
	SDL_RenderPresent(ren);
	//Take a quick break after all that hard work
	SDL_Delay(1000);
}
{% endhighlight %}
<br />

Cleaning Up
-
Before we exit we've got to destroy all the objects we created through the various `SDL_DestroyX` functions and 
quit SDL. **Error handling note:** previously in the program we may have encountered an error and exited early,
in which case we'd have to destroy any SDL objects we had created and quit SDL to properly clean up before exiting.
This part of the error handling is omitted from the lessons since they're such small examples
and it helps keep the code a bit shorter, but in a real world program
proper error handling and clean up is absolutely required.
{% highlight c++ %}
SDL_DestroyTexture(tex);
SDL_DestroyRenderer(ren);
SDL_DestroyWindow(win);
SDL_Quit();
{% endhighlight %}
<br />

End of Lesson
-
If everything went well you should see the image you loaded render over the entire window, wait for 2s and then exit.
If you have any problems, make sure you've got SDL installed and your project configured properly as discussed in 
[Lesson 0: Setting up SDL]({% post_url 2013-08-15-lesson-0-setting-up-sdl %}), or post a question below.

I'll see you again soon in [Lesson 2: Don't Put Everything in Main]({% post_url 2013-08-17-lesson-2-dont-put-everything-in-main %}).

