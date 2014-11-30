---
layout: sdl_lesson
title: "Postscript 0: Properly Finding Resource Paths"
description: ""
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

In this short postscript we'll learn how to make use of [`SDL_GetBasePath`](https://wiki.libsdl.org/SDL_GetBasePath) to
properly resolve the path to our resource directory where we'll be storing all the assets needed for each lesson.
This approach lets us avoid issues with relative paths since it doesn't depend on where the program working
directory is set when it's run. This functionality was introduced in SDL 2.0.1 so if you haven't updated to the latest SDL
be sure to grab that before getting started.

<!--more-->

Lesson Directory Structure
-
`SDL_GetBasePath` will return the path to the directory where the application executable is, so to properly find the resource
directory we'll have to know how to change this path to get the resource directory path. For the lessons I'll be using
the directory structure below, if you're using a different directory structure you'll likely need to make some
modifications to how the resource path is set.

{% highlight text %}
Lessons/
    bin/
        executables in here
    res/
        Lesson1/
            Lesson 1's assets are stored here
    Lesson1/
        src/
            Lesson 1's source code
    include/
        Headers shared between lessons
{% endhighlight %}

Getting the Resource Path
-
We'll now write a convenient utility header containing the `getResourcePath` function which will be used to resolve
the resource path based on the folder structure above. The function will also take a subdirectory name to be
appended to the path so we can then get the Lesson1 resource directory with `getResourcePath("Lesson1")`. The code
below is placed into the shared include directory and named res\_path.h in my code. The comments throughout the code
provide more detail on what's going on so be sure to read through them.

{% highlight c++ %}
#ifndef RES_PATH_H
#define RES_PATH_H

#include <iostream>
#include <string>
#include <SDL.h>

/*
 * Get the resource path for resources located in res/subDir
 * It's assumed the project directory is structured like:
 * bin/
 *  the executable
 * res/
 *  Lesson1/
 *  Lesson2/
 *
 * Paths returned will be Lessons/res/subDir
 */
std::string getResourcePath(const std::string &subDir = ""){
	//We need to choose the path separator properly based on which
	//platform we're running on, since Windows uses a different
	//separator than most systems
#ifdef _WIN32
	const char PATH_SEP = '\\';
#else
	const char PATH_SEP = '/';
#endif
	//This will hold the base resource path: Lessons/res/
	//We give it static lifetime so that we'll only need to call
	//SDL_GetBasePath once to get the executable path
	static std::string baseRes;
	if (baseRes.empty()){
		//SDL_GetBasePath will return NULL if something went wrong in retrieving the path
		char *basePath = SDL_GetBasePath();
		if (basePath){
			baseRes = basePath;
			SDL_free(basePath);
		}
		else {
			std::cerr << "Error getting resource path: " << SDL_GetError() << std::endl;
			return "";
		}
		//We replace the last bin/ with res/ to get the the resource path
		size_t pos = baseRes.rfind("bin");
		baseRes = baseRes.substr(0, pos) + "res" + PATH_SEP;
	}
	//If we want a specific subdirectory path in the resource directory
	//append it to the base path. This would be something like Lessons/res/Lesson0
	return subDir.empty() ? baseRes : baseRes + subDir + PATH_SEP;
}

#endif
{% endhighlight %}
<br />

Using the Resource Path Lookup
-
With our new utility function we can easily construct the resource path for our programs and no longer need to rely
on relative paths and the various hassles that come with them. To get access to this new header in our shared include
directory we'll need to add the directory `include` to our include path.

- **CMake**: In your top level CMakeLists file add `include_directories(include)`.
- **Visual Studio**: Add the include directory through your project preferences, similar to how you set the SDL2
include directories.
- **GCC and Clang**: Use the `-I` flag to add the directory to your include path, eg. `-Iinclude`.

We'll now write a simple program that will print out the resource directory path to make sure everything is working correctly.

{% highlight c++ %}
#include <iostream>
#include <string>
#include <SDL.h>
#include "res_path.h"

int main(int argc, char **argv){
	if (SDL_Init(SDL_INIT_EVERYTHING) != 0){
		std::cerr << "SDL_Init error: " << SDL_GetError() << std::endl;
		return 1;
	}
	std::cout << "Resource path is: " << getResourcePath() << std::endl;

	SDL_Quit();
	return 0;
}
{% endhighlight %}

End of Postscript
-
You'll want to double check that the path output by the test program is correct as we'll be using `getResourcePath` extensively
throughout the lessons to reliably find the various images and other assets we need for our programs. A related function
provided by SDL is [`SDL_GetPrefPath`](https://wiki.libsdl.org/SDL_GetPrefPath) which returns the path where your application
can write personal files (save games, etc.).

I'll see you again soon in [Lesson 1: Hello World!]({% post_url 2013-08-17-lesson-1-hello-world %})

