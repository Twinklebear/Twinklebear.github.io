---
layout: post
title: "Porting a Ray Tracer to Rust, part 1"
description: "The first taste of Rust"
category: "tray_rust"
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

I've decided to port over my physically based ray tracer [tray](https://github.com/Twinklebear/tray)
(source available Jan 1) to [Rust](http://www.rust-lang.org/) to try out the language with a decent
sized project. In the series we'll work through the implementation of a physically based ray tracer built
on the techniques discussed in [Physically Based Rendering](http://pbrt.org/). I won't go into extreme
detail about rendering theory or the less exciting implementation details but will focus more on Rust
specific concerns and implementation decisions along with comparisons vs. my C++ version.
If you're looking to learn more about ray tracing I highly recommend picking up Physically
Based Rendering and working through it. Hopefully throughout the series folks more experienced
with Rust can point out mistakes and improvements as well, since I have no experience with Rust
prior to this series.

With the intro out of the way, let's get started! Since it's the beginning of
the series this is my first time really working with Rust and our goal is pretty simple: render a white
sphere and save the image.

<!--more-->

The Linear Algebra Module
---
I started by porting the linear algebra module used by tray over, since almost everything else
we do in the ray tracer will need basic linear algebra operations. This was pretty straightforward
but I did run into a few minor annoyances with things in the current state of Rust,
`rustc 0.13.0-nightly (636663172 2014-12-28 16:21:58 +0000)`, namely: lack of function overloading
, default parameters and operator overloading for both left and right multiplication.


#### Function Overloading
This is a feature I used extensively throughout the C++ version of the ray tracer which helps
make things a bit more ergonomic. I first ran into this when implementing my vector3 type, in
tray I have overloads for the constructor so that it can be constructed with x, y and z all set
indendently or by setting them all to the same value, as below.

{% highlight c++ %}
Vector(float x, float y, float z) : x(x), y(y), z(z) {}
Vector(float x) : x(x), y(x), z(x) {}
{% endhighlight %}

This is very convenient as there are many times when you simply want a vector that's initialized
to all 0 or 1 for example.
Since this isn't currently supported in Rust these two methods require different names,
I chose `broadcast` for my single value constructor.

{% highlight rust %}
pub fn new(x: f32, y: f32, z: f32) -> Vector {
    Vector { x: x, y: y, z: z }
}
pub fn broadcast(x: f32) -> Vector {
    Vector { x: x, y: x, z: x }
}
{% endhighlight %}

I'd really prefer to just have an overload of `new(x: f32) -> Vector` which performed the same
construction that `broadcast` does currently, although this is a relatively minor annoyance.

#### Default Parameters
This relates closely to the function overloading to simplify commonly written calls, eg. my
C++ vector constructors also default to set the values to 0, so constructing a vector of all 0
values is simply `Vector{}`. This doesn't seem to be currently in Rust, but is another (somewhat minor)
feature that would be nice to have.

#### Overloading Left and Right Multiply
While it was very easy to overload the vector \* scalar operator, writing the same overload
for scalar \* vector doesn't seem to be possible (or perhaps I'm just not figuring it out). On the
topic of operator overloading, I do really like Rust's decision to make them traits, both because it's
clearer than C++'s `operatorX` function style and because they can then be set as requirements for generic
functions. Below is my vector \* scalar overload, it's two extra lines than in C++ but is very clear
to read.

{% highlight rust %}
impl Mul<f32, Vector> for Vector {
    fn mul(self, rhs: f32) -> Vector {
        Vector { x: self.x * rhs, y: self.y * rhs, z: self.z * rhs }
    }
}
{% endhighlight %}

Because operator overloading is done through traits we can set constraints on generic
functions to require that the types being worked on implement certain operations. This makes
the function clearer than in C++ (eg. what types it takes) and also gives much better compilation
errors when types not implementing the required operations are passed. For an extremely simple
comparison lets look at the C++ and Rust implementations of `lerp`.

{% highlight c++ %}
template<typename T>
T lerp(float t, const T &a, const T &b){
    return a * (1.f - t) + b * t;
}
{% endhighlight %}


If we misuse the lerp implementation in C++ we get a decent amount of errors. although gcc-4.9
is quite clear about what went wrong. However these errors are shown as occuring inside the
function call and could be harder to parse for more complex generics.

{% highlight bash %}
test.cpp: In instantiation of ‘T lerp(float, const T&, const T&) [with T = Foo]’:
test.cpp:10:32:   required from here
test.cpp:3:30: error: no match for ‘operator*’ (operand types are ‘float’ and ‘const Foo’)
     return (1.f - t) * a + t * b;
                              ^
test.cpp:3:22: error: no match for ‘operator*’ (operand types are ‘float’ and ‘const Foo’)
     return (1.f - t) * a + t * b;
                      ^
test.cpp: In function ‘T lerp(float, const T&, const T&) [with T = Foo]’:
test.cpp:4:1: warning: control reaches end of non-void function [-Wreturn-type]
 }
 ^
{% endhighlight %}

As a user glancing through some template code in C++ it may not be clear what operations and functions
the type must provide (although for a simple `lerp` it is). Rust solves this by allowing you
to specify requirements on the traits implemented by the types. In `lerp` we need to be able
to multiple the types by floats, add the types to each other and make a copy of them to return.
Specifying these requirements up front makes the function interface much clearer:

{% highlight rust %}
pub fn lerp<T: Mul<f32, T> + Add<T, T> + Copy<T>>(t: f32, a: &T, b: &T) -> T {
    *a * (1.0 - t) + *b * t
}
{% endhighlight %}

If we misuse the lerp implementation in Rust we get some very clear and helpful errors,
telling us why the error occured and what we should do to resolve it. The error messages also
point us to the point of the bad call, which is much more useful than being pointed at a problem
inside some template function, that in the case of a library we may not have even written.
Note that in C++ we also didn't get any errors about the lack of `operator+`, which we'd get next
if we fixed our missing `operator*`.

{% highlight bash %}
tray_rust/src/main.rs:11:15: 11:27 error: the trait `core::kinds::Copy` is not implemented for the type `Foo`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
                                                                ^~~~~~~~~~~~
tray_rust/src/main.rs:11:15: 11:27 note: the trait `core::kinds::Copy` must be implemented because it is required by `tray_rust::linalg::lerp`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
                                                                ^~~~~~~~~~~~
tray_rust/src/main.rs:11:15: 11:27 error: the trait `core::ops::Add<Foo, Foo>` is not implemented for the type `Foo`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
                                                                ^~~~~~~~~~~~
tray_rust/src/main.rs:11:15: 11:27 note: the trait `core::ops::Add` must be implemented because it is required by `tray_rust::linalg::lerp`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
                                                                ^~~~~~~~~~~~
tray_rust/src/main.rs:11:15: 11:27 error: the trait `core::ops::Mul<f32, Foo>` is not implemented for the type `Foo`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
                                                                ^~~~~~~~~~~~
tray_rust/src/main.rs:11:15: 11:27 note: the trait `core::ops::Mul` must be implemented because it is required by `tray_rust::linalg::lerp`
tray_rust/src/main.rs:11     let awd = linalg::lerp(0.5, &Foo, &Foo);
{% endhighlight %}

C++ also provides default implementations of the copy constructor for types while Rust does not,
thus in Rust we must require that `Copy` is implemented for the type. I think Rust's decision to not 
provide copy by default is a good one as it can cause trouble if you forget to delete the
copy constructor and copy-assign operators in C++ and your
type should not be copied. For most types in Rust that should be copyable that I've worked with so far
it's simple enough to just use the default implementation via `#[deriving(Copy)]`.

