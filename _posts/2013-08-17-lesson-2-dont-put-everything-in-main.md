---
layout: sdl_lesson
title: "Lesson 2: Don't Put Everything in Main"
description: "Fun with Functions"
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

In this lesson we'll begin organizing our texture loading and rendering code from the previous lesson by 
moving them out of main and placing them into some useful functions. We'll also write a simple generic
SDL error logger and learn how images are positioned and scaled when rendering with SDL.

<!--more-->

Let's start by declaring some constants for our window width and height. We'll need these later on when
deciding how to position our images.

{% highlight c++ %}
const int SCREEN_WIDTH  = 640;
const int SCREEN_HEIGHT = 480;
{% endhighlight %}
<br />

The SDL Error Logger
-
Throughout lesson 1 we had a lot of repeated code used to print out error messages that was almost the same
for each error, except for some different information about which function went wrong. We can improve on this
with a more generic error logging function that can take any `std::ostream` to write to, a message to print
and will write out the message along with the error message from `SDL_GetError` to the stream.

{% highlight c++ %}
/**
* Log an SDL error with some error message to the output stream of our choice
* @param os The output stream to write the message to
* @param msg The error message to write, format will be msg error: SDL_GetError()
*/
void logSDLError(std::ostream &os, const std::string &msg){
	os << msg << " error: " << SDL_GetError() << std::endl;
}
{% endhighlight %}
<br />

The Texture Loading Function
-
To wrap up the texture loading from lesson 1 we'll create a function that takes a filepath to a BMP
to load and the renderer to load the texture onto and returns the loaded `SDL_Texture*`.
It's also important that this function perform the same error checking we had previously and still return a
`nullptr` in case of an error so that we know something went wrong. We'll define the function `loadTexture`
to do this for us. 

First we initialize an `SDL_Texture*` to `nullptr` so that in case of an error a valid 
`nullptr` is returned instead of a dangling pointer. Next we'll load up the BMP as before and check for errors,
using our new `logSDLError` function to print out any errors that occurred. If the surface loads ok we then
create the texture from the surface and perform an error check on that. If everything goes ok we get back
a valid pointer, if not we'll get back a `nullptr` and the error messages will show up in our log.

{% highlight c++ %}
/**
* Loads a BMP image into a texture on the rendering device
* @param file The BMP image file to load
* @param ren The renderer to load the texture onto
* @return the loaded texture, or nullptr if something went wrong.
*/
SDL_Texture* loadTexture(const std::string &file, SDL_Renderer *ren){
	//Initialize to nullptr to avoid dangling pointer issues
	SDL_Texture *texture = nullptr;
	//Load the image
	SDL_Surface *loadedImage = SDL_LoadBMP(file.c_str());
	//If the loading went ok, convert to texture and return the texture
	if (loadedImage != nullptr){
		texture = SDL_CreateTextureFromSurface(ren, loadedImage);
		SDL_FreeSurface(loadedImage);
		//Make sure converting went ok too
		if (texture == nullptr){
			logSDLError(std::cout, "CreateTextureFromSurface");
		}
	}
	else {
		logSDLError(std::cout, "LoadBMP");
	}
	return texture;
}
{% endhighlight %}
<br />

The Texture Rendering Function
-
In this lesson we're going to be drawing textures at some x,y coordinate while preserving their initial
width and height. To do this we'll need to create a destination rectangle to pass to 
[`SDL_RenderCopy`](http://wiki.libsdl.org/moin.fcg/SDL_RenderCopy) and get the texture's width and height with 
[`SDL_QueryTexture`](http://wiki.libsdl.org/moin.fcg/SDL_QueryTexture) so that its size will be 
preserved when rendering. This is a lot to do each time we want to draw, so we'll create a 
function, `renderTexture`, that will take the x and y coordinates to draw to, the texture
and the renderer and will setup the destination rectangle correctly and draw the texture.

The destination rectangle is a [`SDL_Rect`](http://wiki.libsdl.org/moin.fcg/SDL_Rect) with the x and y
set to the pixel location on the screen we want the texture's top left corner to be at
and the width and height set to the
texture's width and height. The width and height values are retrieved through `SDL_QueryTexture`.
We then render the texture at the destination rectangle and pass `NULL` as the source
rectangle since we still want to draw the entire texture. You can also set your own width and height 
values to shrink or stretch the texture as desired.

{% highlight c++ %}
/**
* Draw an SDL_Texture to an SDL_Renderer at position x, y, preserving
* the texture's width and height
* @param tex The source texture we want to draw
* @param ren The renderer we want to draw to
* @param x The x coordinate to draw to
* @param y The y coordinate to draw to
*/
void renderTexture(SDL_Texture *tex, SDL_Renderer *ren, int x, int y){
	//Setup the destination rectangle to be at the position we want
	SDL_Rect dst;
	dst.x = x;
	dst.y = y;
	//Query the texture to get its width and height to use
	SDL_QueryTexture(tex, NULL, NULL, &dst.w, &dst.h);
	SDL_RenderCopy(ren, tex, NULL, &dst);
}
{% endhighlight %}
<br />

Creating the Window and Renderer
-
We initialize SDL and create our window and renderer the same as in lesson 1 but now we use our `logSDLError`
function to print out any errors that occurred and use the constants we defined earlier as the screen width
and height.
{% highlight c++ %}
if (SDL_Init(SDL_INIT_EVERYTHING) != 0){
	logSDLError(std::cout, "SDL_Init");
	return 1;
}

SDL_Window *window = SDL_CreateWindow("Lesson 2", 100, 100, SCREEN_WIDTH,
	SCREEN_HEIGHT, SDL_WINDOW_SHOWN);
if (window == nullptr){
	logSDLError(std::cout, "CreateWindow");
	SDL_Quit();
	return 1;
}
SDL_Renderer *renderer = SDL_CreateRenderer(window, -1,
	SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
if (renderer == nullptr){
	logSDLError(std::cout, "CreateRenderer");
	cleanup(window);
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

Loading Our Textures
-
In this lesson we'll be drawing a tiled background and a centered foreground image, grab both of them below, or
use your own BMP images.

<figure>
	<figcaption><b>Background Tile</b></figcaption>
	<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson2/background.bmp">
		<img src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson2/background.bmp" />
	</a>
</figure>
<figure>
	<figcaption><b>Foreground</b></figcaption>
	<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson2/image.bmp">
		<img src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson2/image.bmp" />
	</a>
</figure>
<br />

We'll load the textures using our `loadTexture` function and exit if either fails to load. You should update
the filepaths to match your project structure.

{% highlight c++ %}
const std::string resPath = getResourcePath("Lesson2");
SDL_Texture *background = loadTexture(resPath + "background.bmp", renderer);
SDL_Texture *image = loadTexture(resPath + "image.bmp", renderer);
if (background == nullptr || image == nullptr){
	cleanup(background, image, renderer, window);
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

The SDL Coordinate System and Drawing Order
-
The coordinate system used by SDL to place images on the screen has 0,0 at the top-left corner of the window
and `SCREEN_WIDTH,SCREEN_HEIGHT` at the bottom-right corner. Textures are drawn back to front, with each call
to `SDL_RenderCopy` drawing the new texture on top of the current scene, so we'll want to draw our background
tiles first and then draw our foreground image.

Drawing a Tiled Background
-
Our background image is 320x240 pixels and we'd like to tile it so that it fills the entire window, which is
640x480 pixels so we'll need to draw the image four times. Each tile will be scooted over by either
the texture width, height or both depending on the location we want it at so that the tile edges all line up. 
We can retrieve the texture's width through `SDL_QueryTexture` like we did in `renderTexture` 
and then draw each tile, adjusting each draw over and down as needed.

**Exercise Problem:** While it's not so bad to type out the draw positions for just four tiles
it would be ridiculous to do so if we wanted to put down a large number of tiles. How could we compute
the tile positions to fill the screen completely?

**Note:** All of this rendering code will be placed within our main loop, similar to lesson 1.

{% highlight c++ %}
SDL_RenderClear(renderer);

int bW, bH;
SDL_QueryTexture(background, NULL, NULL, &bW, &bH);
renderTexture(background, renderer, 0, 0);
renderTexture(background, renderer, bW, 0);
renderTexture(background, renderer, 0, bH);
renderTexture(background, renderer, bW, bH);
{% endhighlight %}
<br />

Drawing the Foreground Image
-
The foreground image will be drawn centered in the window, but since we specify the draw position for the
top-left corner of the texture we'll need to offset it some to put the center of the image in the center of the screen.
This offset is computed by moving the x draw position left by half the texture width and the y position
up by half the image width from the center of the screen. If we didn't do this offset the top-left corner
of the image would be drawn at the center of the screen instead.

After drawing our textures we'll present the render and give ourselves a few seconds to admire our work.

{% highlight c++ %}
int iW, iH;
SDL_QueryTexture(image, NULL, NULL, &iW, &iH);
int x = SCREEN_WIDTH / 2 - iW / 2;
int y = SCREEN_HEIGHT / 2 - iH / 2;
renderTexture(image, renderer, x, y);

SDL_RenderPresent(renderer);
SDL_Delay(1000);

{% endhighlight %}
<br />

Cleaning Up
-
Before we exit we've got to free our textures, renderer and window and quit SDL.

{% highlight c++ %}
cleanup(background, image, renderer, window);
SDL_Quit();
{% endhighlight %}
<br />

End of Lesson
-
If everything went well and you used the images provided you should see this draw to your window.

<img class="centered" width="500" height="auto" src="/assets/img/lesson_2/result.png">
<br />

If you have any issues check your error log to see where problems may have occurred and/or post a comment below.

I'll see you again soon in [Lesson 3: SDL Extension Libraries!]({% post_url 2013-08-18-lesson-3-sdl-extension-libraries %})

