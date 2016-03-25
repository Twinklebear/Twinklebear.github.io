---
layout: sdl_lesson
title: "Postscript 1: Easy Cleanup"
description: "variadical!"
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

In this quick postscript we'll look into a simple way to clean up our various SDL resources with variadic templates
and template specialization. This will let us clean up all our resources with a single simple call:
`cleanup(texA, texB, renderer, window)` instead of calling all the corresponding `SDL_Destroy/Free*` functions,
saving ourselves a lot of typing.

We'll do this by creating a variadic function `cleanup` that will take the list of SDL resources to be free'd and then
define specializations of it for each resource we'll be passing, eg. for `SDL_Window`, `SDL_Renderer`, `SDL_Texture`
and so on.

<!--more-->

The Variadic Cleanup Function
-
If you're unfamiliar with the C++11's [varidic templates](http://en.wikipedia.org/wiki/Variadic_template) and
[rvalue references and forwarding](http://thbecker.net/articles/rvalue_references/section_01.html) features it may be useful
to do some reading to get some background before continuing on to the implementation. The implementation
of our cleanup function however is actually quite simple. We have a single variadic template function that
calls one of our specialized cleanup functions and then recurses to iterate through the list of arguments.
Since the code for this functionality is so short I've left the detailed explanations in the comments, so be sure to
read through them.

{% highlight c++ %}
#ifndef CLEANUP_H
#define CLEANUP_H

#include <utility>
#include <SDL.h>

/*
 * Recurse through the list of arguments to clean up, cleaning up
 * the first one in the list each iteration.
 */
template<typename T, typename... Args>
void cleanup(T *t, Args&&... args){
	//Cleanup the first item in the list
	cleanup(t);
	//Recurse to clean up the remaining arguments
	cleanup(std::forward<Args>(args)...);
}
/*
 * These specializations serve to free the passed argument and also provide the
 * base cases for the recursive call above, eg. when args is only a single item
 * one of the specializations below will be called by
 * cleanup(std::forward<Args>(args)...), ending the recursion
 * We also make it safe to pass nullptrs to handle situations where we
 * don't want to bother finding out which values failed to load (and thus are null)
 * but rather just want to clean everything up and let cleanup sort it out
 */
template<>
inline void cleanup<SDL_Window>(SDL_Window *win){
	if (!win){
		return;
	}
	SDL_DestroyWindow(win);
}
template<>
inline void cleanup<SDL_Renderer>(SDL_Renderer *ren){
	if (!ren){
		return;
	}
	SDL_DestroyRenderer(ren);
}
template<>
inline void cleanup<SDL_Texture>(SDL_Texture *tex){
	if (!tex){
		return;
	}
	SDL_DestroyTexture(tex);
}
template<>
inline void cleanup<SDL_Surface>(SDL_Surface *surf){
	if (!surf){
		return;
	}
	SDL_FreeSurface(surf);
}

#endif
{% endhighlight %}
<br />

Using the Variadic Cleanup Function
-
To see the usefulness of this cleanup utility let's see how it compresses our calls to the various
`SDL_Destroy/Free*` functions throughout [Lesson 1]({% post_url 2013-08-17-lesson-1-hello-world %}).
In lesson 1 if we found that our bitmap or texture wasn't created successfully we'd need to destroy
the renderer and window before quitting out of SDL and exiting with a failure code. With `cleanup`
we can compress these two lines down to a single call.

{% highlight c++ %}
//We compress these two lines down
//SDL_DestroyRenderer(ren);
//SDL_DestroyWindow(win);
//to a single cleanup call:
cleanup(ren, win);
{% endhighlight %}
<br />

We can also compress the three lines used to free all the resources (texture, renderer and window) at the end of
Lesson 1 down into a single `cleanup` call, passing all the resources we want to free.

{% highlight c++ %}
//We compress these three lines down
//SDL_DestroyTexture(tex);
//SDL_DestroyRenderer(ren);
//SDL_DestroyWindow(win);
//to a single cleanup call:
cleanup(tex, ren, win);
{% endhighlight %}
<br />

`cleanup` can also be used as a drop-in replacement for the various `SDL_Destroy/Free*` functions, although this
doesn't really give us much benefit as far as compressing lines goes.

{% highlight c++ %}
//Cleanup can also swap in for direct calls turning
//SDL_FreeSurface(bmp);
//into
cleanup(bmp);
{% endhighlight %}
<br />

End of Postscript
-
That's all for this postscript, try out `cleanup` yourself by converting your code from Lesson 1 to use it instead of
calling all the `SDL_Destroy/Free*` functions manually. If you run into any issues or have any questions
please post a comment below.

I'll see you again soon in
[Lesson 2: Don't Put Everything in Main]({% post_url 2013-08-17-lesson-2-dont-put-everything-in-main %})!

