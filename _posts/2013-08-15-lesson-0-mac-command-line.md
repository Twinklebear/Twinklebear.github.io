---
layout: sdl_lesson
title: "Lesson 0: Mac Command Line"
description: "Setting Up SDL"
category: "SDL2 Tutorials"
tags: ["SDL2", "Mac", "OS X"]
---
{% include JB/setup %}

To build the projects on OS X we'll be using a simple makefile that will include the framework for us.
The makefile assumes you've installed SDL following the instructions in the .dmg file on the SDL2
downloads page and now have it available as a framework. 

If you're unfamiliar with Makefiles a basic introduction can be found [here](http://mrbook.org/tutorials/make/).

<!--more-->

The Makefile
-
{% highlight makefile %}
CXX = clang++
SDL = -framework SDL2
# If your compiler is a bit older you may need to change -std=c++11 to -std=c++0x
CXXFLAGS = -Wall -c -std=c++11
LDFLAGS = $(SDL)
EXE = SDL_Lesson0

all: $(EXE)

$(EXE): main.o
	$(CXX) $(LDFLAGS) $< -o $@

main.o: main.cpp
	$(CXX) $(CXXFLAGS) $< -o $@

clean:
	rm *.o && rm $(EXE)
{% endhighlight %}
<br />

The Test Program
-
The program we're building for this lesson is a simple sanity check for SDL. It will 
[initialize](https://wiki.libsdl.org/SDL_Init) the SDL video subsystem, check for any
[errors](https://wiki.libsdl.org/SDL_GetError) and then [quit](https://wiki.libsdl.org/SDL_Quit).
The source file should be titled `main.cpp`, or you can change the main.o build dependency
in the makefile to match your source file.

{% highlight c++ %}
#include <iostream>
#include <SDL2/SDL.h>

/*
 * Lesson 0: Test to make sure SDL is setup properly
 */
int main(int, char**){
	if (SDL_Init(SDL_INIT_VIDEO) != 0){
		std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
		return 1;
	}
	SDL_Quit();
	return 0;
}
{% endhighlight %}
<br />

The program should run successfully but nothing should appear to happen if you’ve configured everything properly. If an error occurs make sure you’ve followed all the setup steps properly.

End of Lesson 0
-
If you’re having any trouble setting up SDL please leave a comment below.

I'll see you again soon in [Postscript 0: Properly Finding Resource Paths!]({% post_url 2014-06-16-postscript-0-properly-finding-resource-paths %})

