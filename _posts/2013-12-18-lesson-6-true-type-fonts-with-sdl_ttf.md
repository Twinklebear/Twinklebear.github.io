---
layout: sdl_lesson
title: "Lesson 6: True Type Fonts with SDL_ttf"
description: "font-tastic!"
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

In this lesson we'll see how to perform basic True Type font rendering with the SDL_ttf extension library.
Setting up the library is identical to what we did in
[Lesson 3]({% post_url 2013-08-18-lesson-3-sdl-extension-libraries %}) for SDL_image, but just replace
"image" with "ttf" (Windows users should also copy the included freetype dll over). So [download SDL_ttf](http://www.libsdl.org/projects/SDL_ttf/),
take a peek at the [documentation](http://www.libsdl.org/projects/SDL_ttf/docs/index.html), and let's get started!

<!--more-->

The first thing we'll need after the library is a font to render our text with. I made a pretty awful font using
[BitFontMaker](http://www.pentacom.jp/pentacom/bitfontmaker2/) which you can
[download from the repository](https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson6/sample.ttf), or if you have some other font you'd like to use that's fine too. My font only provides the basic ASCII characters, so if you try to render non-ASCII characters they probably won't show up.
The code for this lesson will build off of what we wrote for Lesson 5, so if you don't have that to start from grab it off [Github](https://github.com/Twinklebear/TwinklebearDev-Lessons/tree/master/Lesson5), the image being
loaded and the clips calculation and drawing will be replaced with what we learn here.

Rendering Text
-
SDL_ttf provides a few different ways for rendering text with varying speed/quality trade-offs, along with the
ability to render UTF8 and Unicode strings and glyphs. The [documentation](http://www.libsdl.org/projects/SDL_ttf/docs/SDL_ttf_42.html#SEC42) provides a nice overview of the different rendering methods available, so it's worth reading
and knowing when you'd want to use which one depending on your speed/quality requirements. For this lesson
we'll be using `TTF_RenderText_Blended` since we don't really have any time constraints and would like our
text to be stylin'. The various render text functions also take an RGB [`SDL_Color`](http://wiki.libsdl.org/SDL_Color)
which we can use to pick the text color to draw.

Unfortunately SDL_ttf can only render to a surface so we'll have to run an additional
step after rendering the text to create a texture from it that we can draw with our renderer. Of course we'll also
need to load a font to use, which is done with [`TTF_OpenFont`](http://www.libsdl.org/projects/SDL_ttf/docs/SDL_ttf_14.html#SEC14), where we can also specify the font size that we want.

Writing Our `renderText` Function
-
To make this easy for ourselves we'll create a function `renderText` that will take a message, font file containing
the TTF font we want to use, the color and size we want and the renderer to load the final texture into. The
function will then open the font, render the text, convert it to a texture and return the texture. Since there
could be some problems along the way we'll also need to check each of our library calls for errors and handle
them appropriately, i.e. clean up any resources, log the error and return `nullptr` so we know something bad happened.
SDL_ttf will report any of its errors through `SDL_GetError` so we can continue to use `logSDLError`
for error logging.

With those requirements in mind, let's write our `renderText` function:
{% highlight c++ %}
/**
* Render the message we want to display to a texture for drawing
* @param message The message we want to display
* @param fontFile The font we want to use to render the text
* @param color The color we want the text to be
* @param fontSize The size we want the font to be
* @param renderer The renderer to load the texture in
* @return An SDL_Texture containing the rendered message, or nullptr if something went wrong
*/
SDL_Texture* renderText(const std::string &message, const std::string &fontFile,
	SDL_Color color, int fontSize, SDL_Renderer *renderer)
{
	//Open the font
	TTF_Font *font = TTF_OpenFont(fontFile.c_str(), fontSize);
	if (font == nullptr){
		logSDLError(std::cout, "TTF_OpenFont");
		return nullptr;
	}	
	//We need to first render to a surface as that's what TTF_RenderText
	//returns, then load that surface into a texture
	SDL_Surface *surf = TTF_RenderText_Blended(font, message.c_str(), color);
	if (surf == nullptr){
		TTF_CloseFont(font);
		logSDLError(std::cout, "TTF_RenderText");
		return nullptr;
	}
	SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surf);
	if (texture == nullptr){
		logSDLError(std::cout, "CreateTexture");
	}
	//Clean up the surface and font
	SDL_FreeSurface(surf);
	TTF_CloseFont(font);
	return texture;
}
{% endhighlight %}
<br />

Performance Warning
-
An important thing to note here is that each time we want to render a message we re-open and close the font, which is
ok for this case since we're only rendering one message a single time, but if we wanted to render a lot of text
and/or render text frequently it would be a much better idea to keep the font open for as long as we needed it.
Our version of `renderText` for this more common use case would take a `TTF_Font*` instead of the font file name,
and wouldn't open or close the font, as the font's lifetime would be managed separately.

Initializing SDL_ttf
-
As with SDL we need to initialize the library before we can use it. This is done via
[`TTF_Init`](http://www.libsdl.org/projects/SDL_ttf/docs/SDL_ttf_8.html#SEC8) which will return 0 on success. To
initialize SDL_ttf we just call this function after initializing SDL and check the return value to make sure it went ok.

{% highlight c++ %}
if (TTF_Init() != 0){
	logSDLError(std::cout, "TTF_Init");
	SDL_Quit();
	return 1;
}
{% endhighlight %}
<br />

Using `renderText`
-
With our handy `renderText` function we can render our message with a very simple call. For this lesson I've chosen
to render "TTF fonts are cool!" in white at a font size of 64 using the terrible font I made earlier. We can
then query the width and height the same as for any other texture and compute the x/y coordinates to draw the
message centered in the window.

{% highlight c++ %}
const std::string resPath = getResourcePath("Lesson6");
//We'll render the string "TTF fonts are cool!" in white
//Color is in RGBA format
SDL_Color color = { 255, 255, 255, 255 };
SDL_Texture *image = renderText("TTF fonts are cool!", resPath + "sample.ttf",
	color, 64, renderer);
if (image == nullptr){
	cleanup(renderer, window);
	TTF_Quit();
	SDL_Quit();
	return 1;
}
//Get the texture w/h so we can center it in the screen
int iW, iH;
SDL_QueryTexture(image, NULL, NULL, &iW, &iH);
int x = SCREEN_WIDTH / 2 - iW / 2;
int y = SCREEN_HEIGHT / 2 - iH / 2;
{% endhighlight %}
<br />

Drawing the Text
-
Finally we can draw the texture as we've done before with our `renderTexture` function.

{% highlight c++ %}
//Note: This is within the program's main loop
SDL_RenderClear(renderer);
//We can draw our message as we do any other texture, since it's been
//rendered to a texture
renderTexture(image, renderer, x, y);
SDL_RenderPresent(renderer);
{% endhighlight %}
<br />

If everything goes well you should see something like this rendered to the screen:

<br />
<img class="centered" width="600" height="auto" src="/assets/img/lesson_6/ttf_fonts_example.png">
<br />


End of Lesson 6
-
That's it for our quick look at SDL_ttf! Don't forget to check out the [documentation](http://www.libsdl.org/projects/SDL_ttf/docs/index.html) for the library to see what else it's capable of. As always, if you run into any issues with
the lesson feel free to post a comment below. I'll see you again soon in Lesson 7: Taking Advantage of Classes.

