---
layout: sdl2_tutorial
title: "Lesson 0: Setting Up SDL"
category: "SDL2 Tutorials"
tags: ["SDL2"]
date: 2013-08-15
url: /sdl2 tutorials/2013/08/15/lesson-0-setting-up-sdl
---

The first step is to get the SDL2 development libraries setup on your system, you can download
them from the [SDL2 downloads page](https://github.com/libsdl-org/SDL/releases).

<!--more-->

C++11 Note
-
Since C++11 provides a bunch of great new features that I'd like to use you'll need a
compiler that supports the new standard. Any modern compiler is compliant (or close enough for us)
these days including gcc, clang and msvc in Visual Studio 2013 and up. With clang and gcc be sure to include the C++11 flag,
`-std=c++11`, or if your compiler is a bit older `-std=c++0x`. C++11 features are enabled by default in 
Visual Studio 2012 and up.

Making Sure Everything is Working
-
Now that you've got the libraries setup on your computer we'll test everything out with a very simple
project. I recommend using CMake to build your executables as it can generate make files or
project files for almost any platform and IDE and is the build system I'll be using for the lessons so
it'll be easier to follow along.

- [CMake]({{< ref 2014-03-06-lesson-0-cmake >}}) (recommended!)
- [Windows Visual Studio]({{< ref 2013-08-15-lesson-0-visual-studio >}})
- [Windows MinGW]({{< ref 2013-08-15-lesson-0-mingw >}})
- [Linux Command Line]({{< ref 2013-08-15-lesson-0-linux-command-line >}})
- [Mac Command Line]({{< ref 2013-08-15-lesson-0-mac-command-line >}})

Don't forget to read [Postscript 0: Properly Finding Resource Paths]({{< ref 2014-06-16-postscript-0-properly-finding-resource-paths >}}) before continuing on to lesson 1 to see how to find the location of assets needed by your program.

