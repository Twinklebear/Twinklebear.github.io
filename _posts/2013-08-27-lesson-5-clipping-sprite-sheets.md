---
layout: sdl_lesson
title: "Lesson 5: Clipping Sprite Sheets"
description: ""
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

It's common in sprite based games to use a larger image file containing many smaller images, such as the 
tiles for a tileset, instead of having a separate image file for each tile. This type of image is known
as a sprite sheet and is very handy to work with since we don't need to change which texture we're drawing
each time but rather just which subsection of the texture.

<!--more-->

In this lesson we'll see how to select subsections of textures using [`SDL_RenderCopy`](http://wiki.libsdl.org/SDL_RenderCopy) and also see a bit on detecting specific key press events, which we'll use to pick which section of 
the texture to draw. The sprite sheet will contain four different colored circles:

<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson5/image.png">
	<img width="200" height="auto" class="centered"
		src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson5/image.png" />
</a>
<br />

A sprite sheet can be built up of many uniform sized sprites, in which case clipping is easy, or many different
sized sprites. To handle a sheet with varying sized sprites we'd need a metadata file that contained the 
location information for the clips. For this lesson our sheet has 4 100x100 sprites. The code for this lesson builds 
off of lesson 4, if you don't have the code to build on top of
grab it from [Github](https://github.com/Twinklebear/TwinklebearDev-Lessons/tree/master/Lesson4) and let's get
started!

Selecting a Subsection of an Image
-
Selecting the subsection of the texture that we want to draw is very easy with SDL. In Lesson 4, the remaining NULL
parameter that we're passing to [`SDL_RenderCopy`](http://wiki.libsdl.org/SDL_RenderCopy) is the source rect, 
which specifies the section of the texture we want to draw. When passing NULL we specify that we want the entire texture, 
but we can easily add a clip rect and start drawing only portions of the texture. To do this we'll be making 
some modifications to our renderTexture function to make it able to take a desired clipping rect, but still
keep some of the shorter syntax and conveniences from before.

Modifying renderTexture
-
To keep from tacking on more and more parameters to our renderTexture function and still maintain the convenience
the defaults provided we'll split it up into two functions. One is practically an identical call
to `SDL_RenderCopy` but provides the clip parameter with a default `nullptr` value. This version of renderTexture will take 
the destination as rect instead, which we can setup ourselves or have constructed by one of our other specialized 
renderTexture functions. The new base rendering function becomes very simple.

{% highlight c++ %}
/**
* Draw an SDL_Texture to an SDL_Renderer at some destination rect
* taking a clip of the texture if desired
* @param tex The source texture we want to draw
* @param ren The renderer we want to draw to
* @param dst The destination rectangle to render the texture to
* @param clip The sub-section of the texture to draw (clipping rect)
*		default of nullptr draws the entire texture
*/
void renderTexture(SDL_Texture *tex, SDL_Renderer *ren, SDL_Rect dst,
	SDL_Rect *clip = nullptr)
{
	SDL_RenderCopy(ren, tex, clip, &dst);
}
{% endhighlight %}
<br />

It was also really nice when we didn't need to create an SDL_Rect for our destination but could just provide
an x and y position and have our rendering function fill in the width and height of the texture. We'll create
an overloaded version of renderTexture that will do this, with some tweaks to handle clipping. We'll add
the clip rect as a parameter with `nullptr` as a default value and in the case that a clip was passed, we'll use 
the clip's width and height instead of the texture's width and height. This way we won't stretch a small
sprite to be the size of its potentially very large sprite sheet when it's drawn. This function is a modification of 
our original renderTexture function, and should look pretty similar.

{% highlight c++ %}
/**
* Draw an SDL_Texture to an SDL_Renderer at position x, y, preserving
* the texture's width and height and taking a clip of the texture if desired
* If a clip is passed, the clip's width and height will be used instead of
*	the texture's
* @param tex The source texture we want to draw
* @param ren The renderer we want to draw to
* @param x The x coordinate to draw to
* @param y The y coordinate to draw to
* @param clip The sub-section of the texture to draw (clipping rect)
*		default of nullptr draws the entire texture
*/
void renderTexture(SDL_Texture *tex, SDL_Renderer *ren, int x, int y,
	SDL_Rect *clip = nullptr)
{
	SDL_Rect dst;
	dst.x = x;
	dst.y = y;
	if (clip != nullptr){
		dst.w = clip->w;
		dst.h = clip->h;
	}
	else {
		SDL_QueryTexture(tex, NULL, NULL, &dst.w, &dst.h);
	}
	renderTexture(tex, ren, dst, clip);
}
{% endhighlight %}
<br />

Determining the Clipping Rectangles
-
In our case it's very easy to automatically compute the clipping rectangles, using a method almost identical
to the tiling method from [Lesson 3](http://twinklebear.github.io/sdl2%20tutorials/2013/08/18/lesson-3-sdl-extension-libraries/#tiling_the_background), however instead of going row by row, we'll go column by column. This way
clip one will be green, two is red, three is blue and four is yellow. The idea behind the math is the same as in
Lesson 3 but switched to wrap on columns. So our y coordinate is calculated by modding the tile index with the 
number of tiles (2), while the x coordinate is taken by dividing the index by the number of tiles. These x and y
coordinates are the x and y indices, so we then scale them to the actual pixel coordinates by multiplying by the 
clip width and height, which is uniform (100x100). Finally we pick a clip to start drawing, in this case the first one.

We also would like to draw our clips in the center of the screen, so we compute those x and y coordinates using
the clip's width and height instead of the texture's.

{% highlight c++ %}
//iW and iH are the clip width and height
//We'll be drawing only clips so get a center position for the w/h of a clip
int iW = 100, iH = 100;
int x = SCREEN_WIDTH / 2 - iW / 2;
int y = SCREEN_HEIGHT / 2 - iH / 2;

//Setup the clips for our image
SDL_Rect clips[4];
for (int i = 0; i < 4; ++i){
	clips[i].x = i / 2 * iW;
	clips[i].y = i % 2 * iH;
	clips[i].w = iW;
	clips[i].h = iH;
}
//Specify a default clip to start with
int useClip = 0;
{% endhighlight %}
<br />

If instead we were using some more complicated sprite sheet with rotated and different sized sprites packed together 
we would need to store their location and rotation information in some kind of metadata file so that we could find 
the clips easily.

Changing Clips Based on Input
-
In order to examine all the clips we've created we'll add some key input handling to our event loop and will
make the keys 1-4 select which clip we want to display. To determine if a key press happened we can check
if our event is of the type `SDL_KEYDOWN` and if it is we can check if the key pressed was one of the keys we're interested
in by checking the keycode information in the event, `e.key.keysym.sym`.
A full list of [event types](http://wiki.libsdl.org/SDL_EventType), [key codes](http://wiki.libsdl.org/SDL_Keycode)
and other [`SDL_Event`](http://wiki.libsdl.org/SDL_Event) information is available in the wiki.

When we receive the key input we're interested in we'll need to update the value of useClip to match the clip
we want to draw. With these additions our event loop will become:

{% highlight c++ %}
while (SDL_PollEvent(&e)){
	if (e.type == SDL_QUIT)
		quit = true;
	//Use number input to select which clip should be drawn
	if (e.type == SDL_KEYDOWN){
		switch (e.key.keysym.sym){
			case SDLK_1:
				useClip = 0;
				break;
			case SDLK_2:
				useClip = 1;
				break;
			case SDLK_3:
				useClip = 2;
				break;
			case SDLK_4:
				useClip = 3;
				break;
			case SDLK_ESCAPE:
				quit = true;
				break;
			default:
				break;
		}
	}
}
{% endhighlight %}
<br />

Drawing our Clipped Image
-
The final thing to do is get the clip we want on the screen! We'll do this by calling our more convenient
version of renderTexture to draw the clip without any extra scaling and passing in the clip we want to use
(the one at useClip).

{% highlight c++ %}
SDL_RenderClear(renderer);
renderTexture(image, renderer, x, y, &clips[useClip]);
SDL_RenderPresent(renderer);
{% endhighlight %}
<br />

End of Lesson 5
-
When you run the program you should see clip 0 (green circle) draw in the center of the screen and should be able to select 
different clips to be drawn with the number keys. If you run into any issues double check your code 
and/or post a question below.

I'll see you again soon in [Lesson 6: True Type Fonts with SDL_ttf!]({% post_url 2013-12-18-lesson-6-true-type-fonts-with-sdl_ttf %})


