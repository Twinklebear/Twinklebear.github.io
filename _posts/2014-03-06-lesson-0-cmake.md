---
layout: sdl_lesson
title: "Lesson 0: CMake"
description: "Setting Up SDL"
category: "SDL2 Tutorials"
tags: ["SDL2", "CMake"]
---
{% include JB/setup %}

CMake is really useful for building the lessons since it lets us generate make files or project files for just about
any platform and IDE. It also helps with resolving dependencies (such as SDL2), platform specific configurations and
much much more. If you're unfamiliar with CMake there's a very nice introduction
available on [their site](http://www.cmake.org/cmake/help/cmake_tutorial.html) to help you get started.

<!--more-->

<blockquote>
<b>Windows users:</b> Since Windows doesn't have any standardized include or library directories like Linux and Mac CMake
can have some trouble resolving dependencies, so we'll need to give it a hand. I've taken the existing FindSDL2
modules for CMake and have modified them a bit to also check for an environment variable named <code>SDL2</code>. You should
create this environment variable and have it point to the root level of the folder containing the SDL2 headers
and libraries you downloaded previously.
</blockquote>

To lookup CMake we'll need a module to find the dependency we want. Typically these are included in the CMake distribution
but for some newer libraries they may not be integrated yet. In the case of SDL2 we'll need to provide our own module
to lookup the dependency. This module is available around online and in the lesson [repository](https://github.com/Twinklebear/TwinklebearDev-Lessons/blob/master/cmake/FindSDL2.cmake). For Windows users I recommend using the modified version from the
lesson repository since it will also check for your `SDL2` environment variable. The existing FindSDL2.cmake that's floating
around will work for Linux and Mac but will likely fail to find the libraries on Windows.

Looking up Assets with Configure Files
-
In addition to resolving dependencies CMake can also generate defines for us using configure files which
can be based on the platform configuration. For the lessons we'll use this feature to make looking up
assets much more convenient by having CMake define our asset path. We provide
a configuration input file which marks the defines we want CMake to fill in with @ characters. To build up
our asset paths we'll also provide a macro `ASSET(A)` that will prepend the asset path from CMake to the string `A`.
This is placed in a configure input file named asset.h.in, shown below.
{% highlight c++ %}
#ifndef ASSET_H
#define ASSET_H

//For having CMake set up the absolute asset path for us
#define ASSET_PATH "@ASSET_PATH@"
#define ASSET(A) (ASSET_PATH A)

#endif
{% endhighlight %}
<br />
Now when we want to reference an asset in our code we can use `ASSET("asset_name")` and CMake will provide the
appropriate path to lookup the asset.

The CMakeLists.txt Files for Our Project
-
Our main CMakeLists file needs to do a few things so that we can build our project easily:
- Append to the CMake module path so we can find our modified SDL2 modules.
- Set an output directory (called `BIN_DIR` here) that we can reference for installing our executables.
- Define our `ASSET_PATH` and set it in the configure file (and add the configure file to the include path).
- Find SDL2 and add the SDL2 include directory to the include path.
- Add the Lesson0 subdirectory to find this Lesson's CMakeLists.txt so that we can build our executable.

This CMakeLists.txt file should be in the top level directory of your project folder for the lessons.
{% highlight cmake %}
cmake_minimum_required(VERSION 2.6)
project(TwinklebearDevLessons)

# Use our modified FindSDL2* modules
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${TwinklebearDevLessons_SOURCE_DIR}/cmake")
# Set an output directory for our binaries
set(BIN_DIR ${TwinklebearDevLessons_SOURCE_DIR}/bin)

# Setup our asset location path, CMake will find the @ASSET_PATH@ string in
# the header and replace it with the value we set here
set(ASSET_PATH ${TwinklebearDevLessons_SOURCE_DIR}/res/)
# Add the asset.h.in configure file input and set the name for the output file
# set the path of asset.h.in as appropriate for your directory structure, I chose
# to place it in the top level of the project
configure_file(asset.h.in asset.h)
# Add our asset configure header to the include path, which will be the build directory
# if you change the path of asset.h (the output of the configure file)
# you'll also need to change this
include_directories(${CMAKE_CURRENT_BINARY_DIR})

# Bump up warning levels appropriately for clang, gcc & msvc
# Also add debug flag for command line builds. IDE users can build debug mode
# from the IDE
if (${CMAKE_CXX_COMPILER_ID} STREQUAL "GNU" OR ${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -pedantic -g -std=c++11")
elseif (${CMAKE_CXX_COMPILER_ID} STREQUAL "MSVC")
	if (CMAKE_CXX_FLAGS MATCHES "/W[0-4]")
		string(REGEX REPLACE "/W[0-4]" "/W4" CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
	else()
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4")
	endif()
endif()

# Look up SDL2 and add the include directory to our include path
find_package(SDL2 REQUIRED)
include_directories(${SDL2_INCLUDE_DIR})

# Look in the Lesson0 subdirectory to find its CMakeLists.txt so we can build the executable
add_subdirectory(Lesson0)
{% endhighlight %}
<br />

The Test Program
-
The program we're building for this lesson is a simple sanity check for SDL. It will initialize all the SDL
subsystems, check for any errors and then quit. Our build system will look for this folder under Lesson0/src/main.cpp.
If you place it elsewhere you'll need to update the file names and subdirectories in the CMakeLists files.
{% highlight c++ %}
#include <iostream>
#include <SDL.h>
//This is how we'll include our asset config file later on when we actually need it
#include "asset.h"

/*
 * Lesson 0: Test to make sure SDL is setup properly
 */
int main(int argc, char** argv){
	if (SDL_Init(SDL_INIT_EVERYTHING) != 0){
		std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
		return 1;
	}
	SDL_Quit();
	return 0;
}
{% endhighlight %}
<br />

To build our executable for Lesson0 we'll need another CMakeLists.txt file within the Lesson0 directory, which our
main CMakeLists file will check since we've added the subdirectory to be searched. Our Lesson0
CMakeLists file is a lot simpler than our main one. We just add an executable to be built from our main.cpp file and tell CMake to
link against the SDL2 libraries. We also add an install target to have the executable be installed to our binary directory.
{% highlight cmake %}
project(Lesson0)
add_executable(Lesson0 src/main.cpp)
target_link_libraries(Lesson0 ${SDL2_LIBRARY})
install(TARGETS Lesson0 RUNTIME DESTINATION ${BIN_DIR})
{% endhighlight %}
<br />

Building With CMake
-
To build the project with CMake we'll want to make a temporary build directory to store the various build output so we
don't polute our source directory with a bunch of junk. From this folder we can then run `cmake -G "Your Generator" ../`
and CMake will generate makefiles or project files for `Your Generator`. You can run `cmake -H` to see which generators
are available on your system. A sample run of building a Unix Makefiles target is shown below.
{% highlight bash %}
$ mkdir build && cd build
$ cmake -G "Unix Makefiles" ../
$ make
$ make install
{% endhighlight %}
<br />

The result of this will be that Unix Makefiles have been generated in the build directory so the project can now be built
with make as usual. Building `make install` will install any targets we've specified (our Lesson0 binary) to their install
locations (`BIN_DIR`). Windows users will also need to copy the relevant SDL2.dll to their install directory so
that the executables can find it. Be sure to copy the appropriate 32bit or 64bit dll depending on which you built.

End of Lesson 0
-
When we add more programs throughout the lesson series you can simply add the subdirectory with
`add_subdirectory(Lesson#)` and then re-use the Lesson0 CMakeLists.txt file but replacing the occurances of
`Lesson0` with `Lesson#`. When we start adding SDL extension libraries we'll have to add some more CMake modules
and link library targets but it's pretty straightforward to setup.

If you're having any problems with the lesson please leave a comment below.

I'll see you again soon in [Lesson 1: Hello World!]({% post_url 2013-08-17-lesson-1-hello-world %})

