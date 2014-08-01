---
layout: sdl_lesson
title: "Lesson 4: Handling Events"
description: "Interacting with the User"
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

In this lesson we'll learn the basics of reading user input with SDL, in this simple example we'll interpret any input
as the user wanting to quit our application.
To read events SDL provides the [`SDL_Event`](http://wiki.libsdl.org/SDL_Event) structure
and functions to get events from the queue such as [`SDL_PollEvent`](http://wiki.libsdl.org/SDL_PollEvent).
The code for this lesson is built off of the lesson 3 code, if you need that code to start from grab it on [Github](https://github.com/Twinklebear/TwinklebearDev-Lessons/tree/master/Lesson3) and let's get started!

<!--more-->

The first change we need to make is to load our new image to display a prompt for input. Grab it below and use our `loadTexture` function to load it up as we did previously.

<a href="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson4/image.png">
	<img width="500" height="auto" class="centered"
		src="https://github.com/Twinklebear/TwinklebearDev-Lessons/raw/master/res/Lesson4/image.png" />
</a>

A Basic Main Loop
-
We'll be adding a main loop to keep the program running until the user quits so that they can use it as long as they want to, instead of for some fixed delay period. The structure of this loop will be very basic.

{% highlight c++ %}
while (!quit){
	//Read user input & handle it
	//Render our scene
}
{% endhighlight %}
<br />

The SDL Event Queue
-
To properly use SDL's event system we'll need at least some understanding of how SDL handles events. When SDL
receives an event it's pushed onto the back of a queue of all the other events that have been received but haven't been
polled yet. If we were to start our program and then resize the window, click the 
mouse and press a key the event queue would look like this.

<img width="600" height="auto" class="centered" src="/assets/img/lesson_4/evntqueue.png">

When we call `SDL_PollEvent` we get the event at the front of the queue, which corresponds to the oldest
event since we last polled. Polling an event removes it from the queue, if we wanted to retrieve
some events without removing them we could use [`SDL_PeepEvents`](http://wiki.libsdl.org/SDL_PeepEvents) with the 
`SDL_PEEKEVENT` flag, but that's beyond the scope of this introduction. I encourage you to read the docs and check
it out later!

Processing the Events
-
In our main loop we'll want to read in every event that's occurred since the previous frame and handle them, 
we can do this by putting [`SDL_PollEvent`](http://wiki.libsdl.org/SDL_PollEvent) in a while loop, since the function will return 1 if an event was read in
and 0 if not. Since all we'll do is quit the program when we get an event we'll set a quit bool to track
whether the main loop should exit or not. So our event processing loop could look like this.

{% highlight c++ %}
//e is an SDL_Event variable we've declared before entering the main loop
while (SDL_PollEvent(&e)){
	//If user closes the window
	if (e.type == SDL_QUIT){
		quit = true;
	}
	//If user presses any key
	if (e.type == SDL_KEYDOWN){
		quit = true;
	}
	//If user clicks the mouse
	if (e.type == SDL_MOUSEBUTTONDOWN){
		quit = true;
	}
}
{% endhighlight %}
<br />

The `SDL_QUIT` event occurs when the user closes our window, `SDL_KEYDOWN` occurs when a key is pressed and
`SDL_MOUSEBUTTONDOWN` occurs if a mouse button is pressed. These are just a few of the wide variety of events
that we can receive and I strongly recommend reading up about the other types in the
[`SDL_Event` documentation](http://wiki.libsdl.org/SDL_Event).

Completing the Main Loop
-
The final part of our main loop will take care of rendering our scene using the same methods as before. When we combine this with our event handling code our basic main loop becomes:

{% highlight c++ %}
//Our event structure
SDL_Event e;
bool quit = false;
while (!quit){
	while (SDL_PollEvent(&e)){
		if (e.type == SDL_QUIT){
			quit = true;
		}
		if (e.type == SDL_KEYDOWN){
			quit = true;
		}
		if (e.type == SDL_MOUSEBUTTONDOWN){
			quit = true;
		}
	}
	//Render the scene
	SDL_RenderClear(renderer);
	renderTexture(image, renderer, x, y);
	SDL_RenderPresent(renderer);
}
{% endhighlight %}
<br />
Our program will repeat until the user asks to exit and will re-draw our image each time.

End of Lesson 4
-
When you run the program you should be able to quit by closing the window, pressing any key or clicking the mouse.
If you have any issues double check your code and/or post your question below.

**Extra Fun:** How could we move the image around? What about moving based on key input?

I'll see you again soon in [Lesson 5: Clipping Sprite Sheets!]({% post_url 2013-08-27-lesson-5-clipping-sprite-sheets %})

