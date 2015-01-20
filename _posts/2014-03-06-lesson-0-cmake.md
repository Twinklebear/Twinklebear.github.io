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
much much more. If you're unfamiliar with CMake there's a nice introduction
available on [their site](http://www.cmake.org/cmake/help/cmake_tutorial.html) to help you get started.

<!--more-->

<blockquote>
<b>Windows users:</b> Since Windows doesn't have any standardized include or library directories like Linux and OS X CMake
can have some trouble resolving dependencies, so we'll need to give it a hand. I've taken the existing FindSDL2
modules for CMake and have modified them a bit to also check for an environment variable named <code>SDL2</code>. You should
create this environment variable and have it point to the root level of the folder containing the SDL2 headers
and libraries you downloaded previously.
</blockquote>

To lookup SDL2 we'll need a module to find the dependency we want. Typically these are included in the CMake distribution
but for some newer libraries they may not be integrated yet. In the case of SDL2 we'll need to provide our own module
to lookup the dependency. This module is available around online and in the lesson [repository](https://github.com/Twinklebear/TwinklebearDev-Lessons/blob/master/cmake/FindSDL2.cmake). For Windows users I recommend using the modified version from the
repository since it will also check for your `SDL2` environment variable. The existing FindSDL2.cmake that's floating
around will work for Linux and Mac but will likely fail to find the libraries on Windows.

The CMakeLists.txt Files for Our Project
-
Our main CMakeLists file needs to do a few things so that we can build our project easily:

- Append to the CMake module path so we can find our modified SDL2 modules.
- Set an install directory (called `BIN_DIR` here) that we can reference for installing our executables.
- Find SDL2 and add the SDL2 include directory to the include path.
- Add the Lesson0 subdirectory to find this lesson's CMakeLists.txt so that we can build it.

This CMakeLists.txt file should be in the top level directory of your project folder for the lessons.
{% highlight cmake %}
cmake_minimum_required(VERSION 2.6)
project(TwinklebearDevLessons)

# Use our modified FindSDL2* modules
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${TwinklebearDevLessons_SOURCE_DIR}/cmake")
# Set an output directory for our binaries
set(BIN_DIR ${TwinklebearDevLessons_SOURCE_DIR}/bin)

# Bump up warning levels appropriately for clang, gcc & msvc
# Also set debug/optimization flags depending on the build type. IDE users choose this when
# selecting the build mode in their IDE
if (${CMAKE_CXX_COMPILER_ID} STREQUAL "GNU" OR ${CMAKE_CXX_COMPILER_ID} STREQUAL "Clang")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -pedantic -std=c++11")
	set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS} ${CMAKE_CXX_FLAGS_DEBUG} -g")
	set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS} ${CMAKE_CXX_FLAGS_RELEASE} -O2")
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
The program we're building for this lesson is a simple sanity check for SDL. It will 
[initialize](https://wiki.libsdl.org/SDL_Init) the SDL video subsystem, check for any
[errors](https://wiki.libsdl.org/SDL_GetError) and then [quit](https://wiki.libsdl.org/SDL_Quit).
Our build system will look for this file under Lesson0/src/main.cpp.
If you place it elsewhere you'll need to update the file names and subdirectories in the CMakeLists files.
{% highlight c++ %}
#include <iostream>
#include <SDL.h>

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

To build our executable for Lesson0 we'll need another CMakeLists.txt file within the Lesson0 directory, which our
main CMakeLists file will check since we've added the subdirectory to be searched. Here we just add an
executable to be built from our source file and tell CMake to link the executable against the SDL2 libraries.
We also add an install target to have the executable be installed to our binary directory.
{% highlight cmake %}
project(Lesson0)
add_executable(Lesson0 src/main.cpp)
target_link_libraries(Lesson0 ${SDL2_LIBRARY})
install(TARGETS Lesson0 RUNTIME DESTINATION ${BIN_DIR})
{% endhighlight %}
<br />

If you've been using the folder hierarchy used in the lessons you should now have something like this.
{% highlight text %}
TwinklebearDevLessons/
    CMakeLists.txt
    Lesson0/
        CMakeLists.txt
        src/
            main.cpp
    cmake/
        FindSDL2.cmake
{% endhighlight %}
<br />

Building With CMake
-
To build the project with CMake we'll want to make a temporary build directory to store the various build artifacts so we
don't pollute our source directory with a bunch of junk. From this folder we can then run `cmake -G "Your Generator" ../`
and CMake will generate makefiles or project files for `Your Generator`. You can run `cmake -H` to see which generators
are available on your system. You can also specify the build type with `-DCMAKE_BUILD_TYPE=Type`, passing Debug will
use the debug flags we set above and likewise for Release. I recommend building with the debug flags since it'll make
it easier to track down problems with your debugger. A sample run of building a Unix Makefiles target 
in debug mode is shown below.
{% highlight bash %}
$ mkdir build && cd build
$ cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Debug ../
$ make
$ make install
{% endhighlight %}
<br />

In this example regular Unix Makefiles will be generated in the build directory so the project can now be built
with make. Running `make install` will install any targets we've specified (our Lesson0 binary) to their install
locations (`BIN_DIR`). Windows users will also need to copy the relevant SDL2.dll to their install directory so
that the executables can find it. Be sure to copy the appropriate 32bit or 64bit dll depending on which you built.

End of Lesson 0
-
When we add more programs throughout the lesson series you can simply add the subdirectory with
`add_subdirectory(Lesson#)` and then re-use the Lesson0 CMakeLists.txt file but replacing the occurances of
`Lesson0` with `Lesson#`. When we start adding SDL extension libraries we'll have to add some more CMake modules
and link targets but it's pretty straightforward to setup.

If you're having any problems with the lesson please leave a comment below.

I'll see you again soon in [Postscript 0: Properly Finding Resource Paths!]({% post_url 2014-06-16-postscript-0-properly-finding-resource-paths %})

