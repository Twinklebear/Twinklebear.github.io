---
layout: sdl_lesson
title: "Lesson 0: MinGW"
description: "Setting Up SDL"
category: "SDL2 Tutorials"
tags: ["SDL2", "MinGW", "Windows"]
---
{% include JB/setup %}

To build the projects with mingw we'll be using a lightweight makefile that will set the
include and library paths along with linking our dependencies for us. The makefile assumes
that you've placed the SDL mingw development libraries under `C:/SDL2-2.0.0-mingw/` and that
you're using the 32bit version of mingw and the 32bit libraries. You should change this to 
match your compiler (32/64bit) and the location of your SDL folder. To use makefiles with mingw call
`mingw32-make.exe` in the folder containing the makefile.

If you're unfamiliar with Makefiles a basic introduction can be found [here](http://mrbook.org/tutorials/make/).

<!--more-->

The Makefile
-
{% highlight makefile %}
CXX = g++
# Update these paths as necessary to match your installation
SDL_LIB = -LC:/SDL2-2.0.0-mingw/i686-w64-mingw32/lib -lSDL2main -lSDL2
SDL_INCLUDE = -IC:/SDL2-2.0.0-mingw/i686-w64-mingw32/include
# If your compiler is a bit older you may need to change -std=c++11 to -std=c++0x
CXXFLAGS = -Wall -c -std=c++11 $(SDL_INCLUDE)
LDFLAGS = -lmingw32 -mwindows -mconsole $(SDL_LIB)
EXE = SDL_Lesson0.exe

all: $(EXE)

$(EXE): main.o
	$(CXX) $< $(LDFLAGS) -o $@

main.o: main.cpp
	$(CXX) $(CXXFLAGS) $< -o $@

clean:
	del *.o && del $(EXE)
{% endhighlight %}
<br />

This makefile is configured to build our project with a console alongside the window since
we'll be writing our error and debug output to stdout.
If you want to use a better file logging method or distribute your program and not have
a console open up you'll want to remove the console flag (`-mconsole`) from the linker flags.

The Test Program
-
The program we're building for this lesson is a simple sanity check for SDL. It will 
[initialize](https://wiki.libsdl.org/SDL_Init) the SDL video subsystem, check for any
[errors](https://wiki.libsdl.org/SDL_GetError) and then [quit](https://wiki.libsdl.org/SDL_Quit).
The source file should be titled `main.cpp`, or you can change the main.o build dependency
in the makefile to match your source file. Before we can run this program we’ll need to copy the SDL
binary into our executable's directory. SDL2.dll can be found in the bin directory in the mingw folders,
you should use the one for the architecture you compiled for (32/64bit).

{% highlight c++ %}
#include <iostream>
#include <SDL2/SDL.h>

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

