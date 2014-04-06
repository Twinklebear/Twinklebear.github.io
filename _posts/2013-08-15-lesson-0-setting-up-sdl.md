---
layout: sdl_lesson
title: "Lesson 0: Setting Up SDL"
description: ""
category: "SDL2 Tutorials"
tags: ["SDL2"]
---
{% include JB/setup %}

The first step is to get the SDL2 development libraries setup on your system, you can download
them from the [SDL2 Downloads page](http://www.libsdl.org/download-2.0.php). 

If you're a Linux user who doesn't have the libraries available in your distribution's package
manager you can download the source and compile with cmake using the standard `make && make install` method. 

<!--more-->

C++11 Note
-
Since C++11 provides a bunch of great new features that I'd like to use you'll need a
compiler that supports the new standard. Any modern compiler is compliant (or close enough for us) 
these days including clang,
gcc and msvc in Visual Studio 2012 and 2013. With clang and gcc be sure to include the C++11 flag, 
`-std=c++11`, or if your compiler is a bit older, `-std=c++0x`. C++11 features are enabled by default in 
Visual Studio 2012/2013.

Making Sure Everything is Working
-
Now that you've got the libraries setup on your computer we'll test everything out with a very simple
project. I recommend using CMake to build your executables as it can generate make files or
project files for almost any platform and IDE and is the build system I'll be using for the lessons so
it'll be easier to follow along.

- [CMake]({% post_url 2014-03-06-lesson-0-cmake %}) (recommended!)
- [Windows Visual Studio]({% post_url 2013-08-15-lesson-0-visual-studio %})
- [Windows MinGW]({% post_url 2013-08-15-lesson-0-mingw %})
- [Linux Command Line]({% post_url 2013-08-15-lesson-0-linux-command-line %})
- [Mac Command Line]({% post_url 2013-08-15-lesson-0-mac-command-line %})
- [Mac XCode](http://twinklebear.github.io/sdl2%20tutorials/2013/08/15/lesson-0-setting-up-sdl/#comment-1035683057)

