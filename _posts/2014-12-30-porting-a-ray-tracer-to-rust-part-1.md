---
layout: post
title: "Porting a Ray Tracer to Rust, part 1"
description: "The first taste of Rust"
category:
tags: ["Rust", "ray tracing", "graphics"]
---
{% include JB/setup %}

I've decided to port over my physically based ray tracer [tray](https://github.com/Twinklebear/tray)
to [Rust](http://www.rust-lang.org/) to finally try out the language with a decent sized project.
In the series we'll work through the implementation of a physically based ray tracer built
on the techniques discussed in [Physically Based Rendering](http://pbrt.org/). I won't go into a lot of
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
make things a bit more ergonomic. I first ran into this when implementing my vector type. In
tray I have overloads for the constructor so that it can be constructed with x, y and z all set
independently or by setting them all to the same value, as below.

{% highlight c++ %}
Vector(float x, float y, float z) : x(x), y(y), z(z) {}
Vector(float x) : x(x), y(x), z(x) {}
{% endhighlight %}

This is convenient as there are many times when you simply want a vector that's initialized
to all 0 or 1 for example. Since function overloading isn't currently supported in Rust
these two methods require different names, I chose `broadcast` for my single value constructor.

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
This relates closely to function overloading in that it also simplifies commonly written calls, eg. my
C++ vector constructors also default to set the values to 0, so constructing a vector of all 0
values is simply `Vector{}`. This doesn't seem to be currently in Rust, but is another (somewhat minor)
feature that would be nice to have.

#### Overloading Left and Right Multiply
While it was very easy to overload the vector \* scalar operator, writing the same overload
for scalar \* vector doesn't seem to be possible (please let me know if this has changed!). On the
topic of operator overloading, I do really like Rust's decision to make them traits
because they can then be set as requirements for generic functions.
Below is my vector \* scalar overload, it's two extra lines than in C++ but is very clear to read.

**Edit (12/31/14)**: [ben0x539](https://www.reddit.com/r/rust/comments/2qvs4z/porting_a_ray_tracer_to_rust_part_1/cnaaep)
mentioned that unsupported left-multiply overloading is a [bug](https://github.com/rust-lang/rust/issues/19035)
which may be getting fixed in [19434](https://github.com/rust-lang/rust/pull/19434).

{% highlight rust %}
impl Mul<f32, Vector> for Vector {
    fn mul(self, rhs: f32) -> Vector {
        Vector { x: self.x * rhs, y: self.y * rhs, z: self.z * rhs }
    }
}
{% endhighlight %}

**Edit (5/9/15)**: Overloading left and right multiply is now supported in Rust. Additionally the method
for writing overloaded operators has changed significantly with the addition of associated types. The
current implementation of right and left multiply for `Vector` are now:

{% highlight rust %}
// Multiply a vector by a f32 on the right, eg. `vec * 2.0`
impl Mul<f32> for Vector {
    type Output = Vector;
    /// Scale the vector by some value
    fn mul(self, rhs: f32) -> Vector {
        Vector { x: self.x * rhs, y: self.y * rhs, z: self.z * rhs }
    }
}

// Multiply a f32 by a vector on the right, eg. `2.0 * vec`
impl Mul<Vector> for f32 {
    type Output = Vector;
    /// Scale the vector by some value
    fn mul(self, rhs: Vector) -> Vector {
        Vector { x: self * rhs.x, y: self * rhs.y, z: self * rhs.z }
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

If we misuse the lerp implementation in C++ we get a decent amount of errors. gcc-4.9
is quite clear about what went wrong, but these errors are shown as occuring inside the
function call (since that's the point of error) and would be harder to parse for more complex functions.

{% highlight text %}
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
to multiply the types by floats, add the types to each other and make a copy of them to return.
Specifying these requirements up front makes the function interface much clearer:

{% highlight rust %}
pub fn lerp<T: Mul<f32, T> + Add<T, T> + Copy<T>>(t: f32, a: &T, b: &T) -> T {
    *a * (1.0 - t) + *b * t
}
{% endhighlight %}

If we misuse the lerp implementation in Rust we get some pretty clear and helpful errors,
telling us why the error occured and what we should do to resolve it. The error messages also
point us to the location of the bad call, which is much more useful than being pointed at a problem
inside some template function.
Note that in C++ we also didn't get any errors about the lack of `operator+`, which we'd get next
if we fixed our missing `operator*`.

{% highlight text %}
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
type should not be copied. For most types that should be copyable that I've worked with so far
it's simple enough to just use a compiler generated implementation via `#[deriving(Copy)]`.

Rust's Module System
---
In tray I chose to split up the various components of the ray tracer into their own libraries
which are then statically linked into the main executable.
This design is also possible in Rust by splitting functionality up into
independent modules. I had some difficulty initially understanding how to work with modules
and how inter-module dependencies worked but after reading through the
[guide](http://doc.rust-lang.org/guide-crates.html) the end result is very nice. tray\_rust is organized
with most functionality implemented in separate modules that are
built into a library and used by `main.rs` to render the image.

Under `src` I have the default executable and library files, `main.rs` and `lib.rs`. Also under `src`
are the various module subdirectories, eg. `linalg` for the linear algebra module, each containing
a `mod.rs` which defines some module level functions and re-exports the sub-modules implementing
other functionality, such as the `vector` module in `linalg`. The end result of this is that I can
have a very simple `lib.rs` which just publicly exports the various modules:

{% highlight rust %}
pub mod linalg;
pub mod film;
pub mod geometry;
{% endhighlight %}

In `main.rs` I can then tell Rust I need to build and link against the default library crate for
the executable, `tray_rust` which is defined by `lib.rs`, and use the modules:

{% highlight rust %}
extern crate tray_rust;

use tray_rust::linalg;

fn main() {
    let v = linalg::Vector::new(1.0, 2.0, 3.0);
    println!("Hello! {}", v);
}
{% endhighlight %}

Inter-module dependencies and circular dependencies are also handled very nicely. In the geometry module
if I need access to some of the types in `linalg` I can simply `use linalg;` and not need to worry about
dealing with fiddly link order requirements. Circular dependencies
aren't a problem at all, which is nice coming from C++ where they can be a bit annoying, requiring
forward declarations and such.

#### Re-exporting From Modules
I initially struggled with the sheer amount of typing required for some of the nested modules. Since my
`Vector` struct is in the `vector` module within the `linalg` module to access it I would have to type
`linalg::vector::Vector`, which is a mouthful. While important to avoid naming conflicts I thought this
was pretty excessive and after some googling stumbled onto [re-exporting from modules](http://stackoverflow.com/questions/22596920/rust-splitting-a-single-module-across-several-files). This lets
us re-export the `Vector` type from the `linalg` module allowing us to use it as `linalg::Vector`,
which I think is more than enough to avoid name conflicts. This is done in the linalg module file,
`linalg/mod.rs` where we export the various sub-modules and re-export their types:

{% highlight rust %}
pub use self::vector::Vector;

pub mod vector;
{% endhighlight %}

Working With Traits
---
In my C++ ray tracer geometry is defined by an interface that provides methods such as `intersect` which
tests a ray for intersection with some piece of geometry, making it very easy to add new geometry types
to the ray tracer by implementing the interface. Additionally we separate the definition of some
geometry with its occurance in the
scene, so that a single model may appear multiple times in the scene with different materials and
transformations, a method known as instancing. To keep things simple when implementing our bounding
volume hierarchy our instance type also implements the geometry interface, simply transformating the
ray into object space and then calling the geometry's intersect method.

{% highlight c++ %}
class Geometry {
public:
    virtual bool intersect(Ray &ray, DifferentialGeometry &dg) const = 0;
};
{% endhighlight %}

This technique carries over directly to Rust in the form of traits. Instead of providing a base class
with pure virtual methods like we'd do in C++ we define a `Geometry` trait that provides these
same methods and write implementations for our geometry such as our Sphere type.
Below is the geometry trait implemented by the various scene geometry types in tray\_rust.

{% highlight rust %}
pub trait Geometry {
    fn intersect(&self, ray: &mut linalg::Ray) -> Option<DifferentialGeometry>;
}
{% endhighlight %}

`intersect` has an interesting return type, which lets me talk about another cool feature of Rust: no
null pointers! Instead Rust defines an `Option<T>` type which can be either `Some(T)` or `None` and
both cases must be considered. In C++ (and C, Java, etc) it's easy to ignore the possibility that
a pointer may be null resulting in seg faults, null pointer exceptions and more. Rust avoids the [billion
dollar mistake](http://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare)
by forcing you to not be [sloppy](http://arthurtw.github.io/2014/12/21/rust-anti-sloppy-programming-language.html).

In my C++ version I would take the DifferentialGeometry as a mutable reference and return a
bool if the ray intersected the object, filling out the differential geometry with the hit info if it
hit. In Rust this is expressed much cleaner, if there's a hit we return `Some(DifferentialGeometry)`
otherwise we simply return `None`. The DifferentialGeometry also needs to send back information about
the instance and geometry that was hit, leading to the next topic: lifetimes in Rust.

Lifetimes in Rust
---
The concept and enforcement of [ownership](http://doc.rust-lang.org/guide-ownership.html) in Rust
was one of the features that initially got me interested in the language. For the most part lifetimes
are implicit in the language, however sometimes the compiler needs some assistance deducing lifetimes
for some variables. I first encountered this when writing my `DifferentialGeometry` struct which needs
to return back references to the hit `Geometry` and `Instance` so we can shade the hit point properly.
In order to verify the code is valid the compiler needs to check that the geometry and instance
referenced by the differential geometry will not be outlived by the differential geometry, as this
would result in dangling references. To specify this separate lifetime on a struct we'd write:

{% highlight rust %}
pub struct DifferentialGeometry<'a> {
    // This isn't quite correct yet!
    pub geom: &'a Geometry,
}
{% endhighlight %}

#### Error: Explicit Lifetime Bound Required
Writing the above `geom` member resulted in the most difficult error message I encountered
so far in Rust. Attempting to compile the above results in:

{% highlight text %}
src/geometry/differential_geometry.rs:17:19: 17:27 error: explicit lifetime bound required
src/geometry/differential_geometry.rs:17     pub geom: &'a Geometry,
                                                           ^~~~~~~~
{% endhighlight %}

The message is actually quite clear, if I knew what an explicit lifetime bound was. However it
doesn't seem to be mentioned in the guides which is what made resolving this error
much more challenging than previous ones. After a decent amount of googling I
found that while the way I wrote `geom` is correct for a regular struct a trait
requires an explicit lifetime bound since the type of data being referenced is unknown (we only know
it implements the trait). This is resolved by bounding the lifetime with
`Geometry + 'a` and the correct form is:

{% highlight rust %}
pub struct DifferentialGeometry<'a> {
    pub geom: &'a (Geometry + 'a),
}
{% endhighlight %}

I'd like to find some more information on what exactly this means, such as
what a lifetime bound tells the compiler and how it's used. Unfortunately I didn't have much luck finding
information on this, if anyone has some links please do let me know.

**Edit (12/31/14)**: [@JakeGoulding](https://twitter.com/JakeGoulding) pointed me to one of his answers
on [stack overflow](http://stackoverflow.com/questions/27675554/type-definition-with-a-trait-differences-of-specifying-an-explicit-lifetime-bou/27678350#27678350) which I found to be helpful.
Another [answer](http://stackoverflow.com/questions/26212397/rust-lang-references-to-traits-in-structs/26213294#26213294) linked in the thread also has a really nice explanation. As a result of reading the
answers I've changed the geom member's type to `&'a (Geometry + 'static)` to require the object
implementing the trait that we're referring to be a struct, since we won't be implementing Geometry
for reference types.

#### A Poor Design Choice
The DifferentialGeometry struct also contains a design decision that I'm not very happy with.
The differential geometry is initially created within the geometry that was hit, since it doesn't know
about the instance that is using it that was hit it's not able to set the instance member. This
results in the instance member of DifferentialGeometry having to be written as an optional reference,
when really it's not optional. Any geometry we hit is associated with an instance, it's just that
we don't know which at the time of hitting the geometry itself, we need to go back up the call stack to
the instance that called the geometry's intersect method.
This results in the DifferentialGeometry struct being written as:

{% highlight rust %}
pub struct DifferentialGeometry<'a, 'b> {
    pub p: Point,
    pub n: Normal,
    pub ng: Normal,
    pub geom: &'a (Geometry + 'a),
    pub instance: Option<&'b Instance<'b>>,
}
{% endhighlight %}

Within the Sphere's implementation of `Geometry::intersect` we know the geometry and hit information
but not the instance and thus if the sphere is intersected we return:

{% highlight rust %}
Some(DifferentialGeometry::new(&p, &n, &n, self, None))
{% endhighlight %}

Then in the instance using the geometry we see that it was hit and transform
the DifferentialGeometry back into world space and set the instance:

{% highlight rust %}
impl<'a> Geometry for Instance<'a> {
    fn intersect(&self, ray: &mut linalg::Ray) -> Option<DifferentialGeometry> {
        let mut local = self.inv_transform * *ray;
        let mut dg = match self.geom.intersect(&mut local) {
            Some(dg) => dg,
            None => return None,
        };
        ray.max_t = local.max_t;
        dg.p = self.transform * dg.p;
        dg.n = self.transform * dg.n;
        dg.ng = self.transform * dg.ng;
        dg.instance = Some(self);
        Some(dg)
    }
{% endhighlight %}

One option is to give Instance its own intersect method and have the Geometry intersect function
just return back the hit point information and have the Instance fill out the geometry and instance
references. This isn't such a good option though since it breaks the illusion that instances are just
geometry and will cause trouble when trying to write a bounding volume hierarchy that we can put
the instances in the scene into and can also use to construct BVHs on triangle meshes to accelerate
intersection testing.

As far as the end user of the intersect call is concerned there will always be a geometry and instance
reference on the DifferentialGeometry returned but I'm not sure how to express this. Another possibility
would be to have another Intersection type which didn't have the option and could be constructed
from an `Option<DifferentialGeometry>` and would return `None` if the DifferentialGeometry or the
instance was `None` (although the latter wouldn't happen), otherwise it would unwrap the instance
member's option and return `Some<Intersection>`. I'll probably look into implementing this as the
cleanest solution I can think of even though it's really just a band-aid. If anyone has some ideas
or suggestions, please leave a comment or get in touch on [Twitter](https://twitter.com/_wusher)
or IRC (I'm Twinklebear on freenode and moznet).

Testing
---
Rust also has built in support for specifying [tests and benchmarks](http://doc.rust-lang.org/guide-testing.html) by placing `#[test]` or `#[bench]` attributes respectively. These are then run using
[Cargo](https://crates.io/) with `cargo test` or `cargo bench`. This built in support makes it very 
easy to write and run unit and integration tests for your code and is really convenient coming from
C++ where testing is done through third party libraries.

Rustdoc
---
Rust comes with a built in [documentation generation tool](http://doc.rust-lang.org/rustdoc.html)
that makes it really easy to have nice documentation for both the language and user libraries by
just running `cargo doc` on your crate. Since the generated doc site is all static pages it's simple
to host them on [Github pages](https://pages.github.com/) or browse them locally.
For example here is the rustdoc for this [project](http://www.willusher.io/tray_rust/tray_rust/).
Good documentation is critical for any library or decent sized project and having it standardized
and built into the
language like this will hopefully improve the overall quality of documentation for user libraries.

Putting it all Together
---
Now that we've got modules to handle [linear algebra](https://github.com/Twinklebear/tray_rust/tree/master/src/linalg), [geometry](https://github.com/Twinklebear/tray_rust/tree/master/src/geometry) and [camera/image operations](https://github.com/Twinklebear/tray_rust/tree/master/src/film) we have everything
we need to render a sphere! In `main.rs` we create our render
target, camera and sphere then attach the sphere to an instance and loop over the pixels in the image,
firing rays through each and checking for intersections:

{% highlight rust %}
extern crate tray_rust;

use tray_rust::linalg;
use tray_rust::film;
use tray_rust::geometry;
use tray_rust::geometry::Geometry;

fn main() {
    let width = 800u;
    let height = 600u;
    let mut rt = film::RenderTarget::new(width, height);
    let camera = film::Camera::new(linalg::Transform::look_at(
        &linalg::Point::new(0.0, 0.0, -10.0), &linalg::Point::new(0.0, 0.0, 0.0),
        &linalg::Vector::new(0.0, 1.0, 0.0)), 40.0, rt.dimensions());
    let sphere = geometry::Sphere::new(1.5);
    let instance = geometry::Instance::new(&sphere,
        linalg::Transform::translate(&linalg::Vector::new(0.0, 2.0, 0.0)));
    for y in range(0, height) {
        for x in range(0, width) {
            let px = (x as f32 + 0.5, y as f32 + 0.5);
            let mut ray = camera.generate_ray(px);
            match instance.intersect(&mut ray) {
                Some(_) => rt.write(px.0, px.1, &film::Colorf::broadcast(1.0)),
                None => {},
            }
        }
    }
    film::write_ppm("out.ppm", width, height, rt.get_render().as_slice());
}
{% endhighlight %}

The executable and library modules are built and the executable run with `cargo run`.
While the resulting image isn't very impressive, we're well on our way to writing a flexible
physically based ray tracer.

<img src="http://i.imgur.com/fO5GVbt.png" class="img-fluid">

Final Thoughts
---
While I did encounter some minor annoyances with Rust I'm really happy with how the language
is shaping up as it nears 1.0 and look forward to the 1.0 release. One other difference compared
to C++ I didn't mention is that variables in Rust are immutable by default and must be explicitly
declared mutable whereas C++ defaults to mutable variables.
I think Rust's decision of immutable by default is great, most of the time I find that I really only
need a few mutable variables in my programs while everything else is constant or locally constant
and used to compute other constant results or operate on the few mutable variables.

#### Until Next Time
In the next post I'll discuss the process of making tray\_rust multithreaded and adding support
for some simple materials and lights which we'll then render using Whitted recursive ray tracing.
While this ray tracing method doesn't account for global illumination like path tracing or photon
mapping it's simple to implement and very fast and will help us develop and test our abstractions
for integrators, materials and lights.

If you have comments, suggestions for improvements or just want to say "hi" feel free to comment below,
or contact me on [Twitter](https://twitter.com/_wusher) or IRC (I'm Twinklebear on freenode and moznet).
The code for the Rust ray tracer is MIT licensed and available on [Github](https://github.com/Twinklebear/tray_rust).

