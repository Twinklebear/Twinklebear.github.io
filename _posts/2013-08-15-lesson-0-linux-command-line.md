---
layout: sdl_lesson
title: "Lesson 0: Linux Command Line"
description: "Setting Up SDL"
category: "SDL2 Tutorials"
tags: ["SDL2", "Linux"]
---
{% include JB/setup %}

To build the projects on Linux we'll be using a simple makefile that will setup the include and library
dependencies for us. The makefile assumes that your SDL libraries are installed under `/usr/local/lib`
and the headers are under `/usr/local/include`. These are the install locations if you built the
project through cmake, some more detail on building from source can be found [here](http://twinklebear.github.io/sdl2%20tutorials/2013/08/15/lesson-0-linux-command-line/#comment-1053605032). 
If you've installed it through your package manager or placed the libraries 
and headers elsewhere you may need to change these paths to match your installation. You can also check the output
of `sdl2-config` with the `--cflags` and `--libs` switches to locate your install, assuming you haven't moved it.

If you're unfamiliar with Makefiles a basic introduction can be found [here](http://mrbook.org/tutorials/make/).

<!--more-->

The Makefile
-
{% highlight makefile %}
CXX = g++
# Update these paths to match your installation
# You may also need to update the linker option rpath, which sets where to look for
# the SDL2 libraries at runtime to match your install
SDL_LIB = -L/usr/local/lib -lSDL2 -Wl,-rpath=/usr/local/lib
SDL_INCLUDE = -I/usr/local/include
# You may need to change -std=c++11 to -std=c++0x if your compiler is a bit older
CXXFLAGS = -Wall -c -std=c++11 $(SDL_INCLUDE)
LDFLAGS = $(SDL_LIB)
EXE = SDL_Lesson0

all: $(EXE)

$(EXE): main.o
	$(CXX) $< $(LDFLAGS) -o $@

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

The program should run successfully but nothing should appear to happen if you've configured everything
properly. If an error occurs make sure you've followed all the setup steps properly.

End of Lesson 0
-
If you're having any trouble setting up SDL please leave a comment below.

I'll see you again soon in [Postscript 0: Properly Finding Resource Paths!]({% post_url 2014-06-16-postscript-0-properly-finding-resource-paths %})

