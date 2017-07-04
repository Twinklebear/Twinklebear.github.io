---
layout: post
title: "Safe Memory Arenas in Rust"
description: ""
category: rust
tags: [rust]
published: false
---
{% include JB/setup %}

I recently wrote a memory arena in Rust for use in my ray tracer, and in
the process learned and took advantage of some interesting and powerful
features of the language. At its core a memory arena is a block of bytes
which we construct objects into, using placement new. In my C++ version this
system is very easy to misuse. For example, questions like "How long is something
I allocate valid? For the arena's lifetime? How do I know that lifetime?", "What if
the arena is cleared and something else created where I was pointing?", and
"Is the destructor of my object going to be called?" are hard to answer.
By leveraging Rust's borrow checker, type system and convenience types
like `PhantomData`, we can tackle all of these questions and arrive at a
performant and easy to use solution.

<!--more-->

# 1. Introduction

The crate built using the concepts described in this post is
light\_arena which is available on [crates.io](https://crates.io/crates/light_arena)
and [Github](https://github.com/Twinklebear/light_arena). Unfortunately
the placement in syntax and placement new features in Rust are still
experimental, meaning this crate requires nightly Rust. In the following
sections we'll briefly review some key general and Rust-specific concepts
needed to describe the implementation of light\_arena.

## 1.1. Memory Arenas

In programs where frequent dynamic allocation is required, the performance impact
of making these frequent allocations can be unacceptable. For example, in tray\_rust
in order to allow textures to change material properties at each surface point,
the textures are sampled when getting material properties for a point, and new BRDFs
are created with the resulting parameters. Surface shading is one of the most frequent
operations performed in a ray tracer, and the resulting memory churn of these frequent
allocations and deallocations can introduce a serious performance penalty. To resolve
this, [PBRT](http://pbrt.org/) suggests to use a memory arena to serve these allocation
requests.

A memory arena (or sometimes, [memory pool](https://en.wikipedia.org/wiki/Memory_pool)),
is a pre-allocated buffer we can use as the backing memory store for dynamic allocations.
Since the memory is allocated up front there's no to make new allocation requests (e.g. malloc)
when allocating. Instead, we mark a region of bytes in the arena as occupied and construct
the object in place. When releasing objects there are a few options. If the stored objects
potentially perform dynamic allocation themselves, we would need to step through the
region and destroy the objects. However, if the objects are Plain-Old-Data we can just release
the containing buffer. light\_arena only supports storing POD types for simplicity, since
it's all I needed for tray\_rust, other crates like [any-arena](https://github.com/pczarn/any-arena)
are available which can store non-POD types.

## 1.2. Placement Syntax

[Placement syntax](https://en.wikipedia.org/wiki/Placement_syntax) is a
language feature which allows us to construct objects in place in some block of memory.
Rather than creating an object on the stack and copying it into the memory arena's
buffer, we want to directly construct the object in the space reserved for it
in the arena. In C++ this is done by passing the pointer to the memory to
construct the object in when calling `new`.

{% highlight c++ %}
std::vector<char> buffer(1024, 0);
int *my_int = new(buffer.data()) int(5);
{% endhighlight %}

In nightly Rust placement syntax is implemented via the combination of three traits,
behind the feature gate `placement_new_protocol` while the arrow syntax used to
invoke it is behind the `placement_in_syntax` feature gate.

The [`Placer`](https://doc.rust-lang.org/std/ops/trait.Placer.html) trait
is conceptually the manager of the backing data being used
to serve allocations. It requires the implementation of the `make_place` function,
which will return a type implementing [`InPlace`](https://doc.rust-lang.org/std/ops/trait.InPlace.html)
and [`Place`](https://doc.rust-lang.org/std/ops/trait.Place.html) traits.
The `Place` type represents a location of memory where the object can be constructed,
and `InPlace` provides a method to return the result of the in place construction
so the caller can assign it to a local variable.

{% highlight rust %}
pub trait Placer<Data: ?Sized> {
	type Place: InPlace<Data>;
	fn make_place(self) -> Self::Place;
}

pub trait Place<Data: ?Sized> {
    fn pointer(&mut self) -> *mut Data;
}

pub trait InPlace<Data: ?Sized>: Place<Data> {
    type Owner;
    unsafe fn finalize(self) -> Self::Owner;
}
{% endhighlight %}

By implementing these traits we can eventually write code like:

{% highlight rust %}
let mut arena = // some T: Placer
let x = arena <- 14.0f32;
println!("x = {}", x);
{% endhighlight %}

The left arrow syntax is the placement in syntax in Rust, and is the syntactic sugar
for invoking the the traits and compiler features to perform the actual allocation
of the object (the float32) in place using the arena.

## 1.3. Rust Lifetimes

In Rust, the validity of references to objects are tracked at compile time using
lifetimes.
A full coverage of Rust's ownership, borrowing and lifetime system is beyond the scope
of this short post, for a full coverage or answers to questions lingering after
this section see chapters
[4](https://doc.rust-lang.org/book/second-edition/ch04-00-understanding-ownership.html)
and [10](https://doc.rust-lang.org/book/second-edition/ch10-00-generics.html) of
the [Rust book](https://doc.rust-lang.org/book/second-edition/).

Each object in Rust has an implicit lifetime, however in some
cases where the compiler can't deduce the lifetime we need to be explicit, e.g.
when storing a reference as a member of a struct. Then in the struct's implementation
we can tie this lifetime associated with it to an actual lifetime of an object. Lifetime
variables are written as `'name`, e.g. `'a` is commonly used. In the following code,
the struct `Foo` stores a reference to a float, since the lifetime can't be deduced
in the struct declaration we provide a lifetime variable `'a`. To tie this lifetime
to the object borrowed by `Foo` when it's created in our implementation we associate
the lifetime variable with the borrow of the variable `y` in `Foo::new`. Try
playing with the code in the [playground](https://play.rust-lang.org/?gist=8e30ff2742c92797a741a6288723dfed&version=stable&backtrace=0)! Try taking the `'a` off the `y` parameter.

{% highlight rust %}
struct Foo<'a> {
	x: &'a f32
}
impl<'a> Foo<'a> {
	pub fn new(y: &'a f32) -> Foo<'a> {
		Foo { x: y }
	}
}

fn main() {
	let a = 10.5;
	let f = Foo::new(&a);
	println!("f.x = {}", f.x);
}
{% endhighlight %}

The lifetimes are then used at compile time to validate that references to objects
don't outlive the objects being referred to. For example, the following main function
attempts to return a `Foo` instance outside of the scope that the object it refers to
lives for, and will fail compile.

{% highlight rust %}
fn main() {
	let f2 = {
		let a = 10.5;
		let f = Foo::new(&a);
		println!("f.x = {}", f.x);
		f
	};
}
{% endhighlight %}

## 1.4. Phantom Data

Occasionally in Rust, typically when working with unsafe code, we want to constrain
a type on some type or lifetime parameters but have no members of the type which
need these parameters. For example, in our memory arena we'll want to tie the lifetime
of the object allocated in the `Place` to the lifetime of the `Placer`. We'll also
want toparameterize the struct on the type of object being allocated so this type
information is available for deducing the type of `Data` when we implement `Place<Data>`
and `InPlace<Data>`. To this end, we can use the
[`PhantomData<T>`](https://doc.rust-lang.org/std/marker/struct.PhantomData.html)
type in Rust, which is a zero-sized type that acts like it stores a `T`. See
the [Nomicon](https://doc.rust-lang.org/nomicon/phantom-data.html) for more details,
but in short this allows us to track the type being allocated without needing to store
a copy of a `T` in our `Place`. We can also store the lifetime to associate with the
returned object in the `PhantomData` as well, this can allow us to pass valid lifetimes
back to safe code and keep compile time safety guarantees when dealing with
unsafely created references.

{% highlight rust %}
struct Bar<'a, T> {
	phantom: PhantomData<&'a T>,
	...
}
impl<'a, T> Place<T> for Bar<'a, T> {
	...
}
impl<'a, T> InPlace<T> for Bar<'a, T> {
	type Owner = &'a T;
	...
}
{% endhighlight %}

# 2. A Toy Arena Example

With all these pieces we can now implement a toy example memory arena which simply
allocates from a fixed 512 byte buffer. Our struct `ToyArena` will be the memory arena
holding the actual buffer we use to allocate objects in, while `ToyPlace` will
be `Place` type returned to satisfy the allocation. To keep things simple we'll overwrite
the buffer with the latest allocation each time, instead of tracking capacities and usage
of the buffer. `ToyPlace` will borrow the `ToyArena` to get access to the buffer to
allocate into and will track the type `T` being allocated with a `PhantomData`.
Here we also apply the restriction that `T` is `Copy`, meaning it's Plain-Old-Data,
since we won't be calling any `Drop` methods and as a result would leak allocations
or resources held by `T`.

{% highlight rust %}
struct ToyArena {
    buffer: [u8; 512],
}
struct ToyPlace<'a, T: Copy> {
    toy_arena: &'a mut ToyArena,
    phantom: PhantomData<T>
}
{% endhighlight %}

{% highlight rust %}
impl<'a, T: 'a + Copy> Placer<T> for &'a mut ToyArena {
    type Place = ToyPlace<'a, T>;
    
    fn make_place(self) -> ToyPlace<'a, T> {
        println!("Placer::make_place");
        ToyPlace { toy_arena: self, phantom: PhantomData }
    }
}
{% endhighlight %}

{% highlight rust %}
impl<'a, T: Copy> Place<T> for ToyPlace<'a, T> {
    fn pointer(&mut self) -> *mut T {
        println!("Place::pointer");
        self.toy_arena.buffer.as_mut_ptr() as *mut T
    }
}
impl<'a, T: 'a + Copy> InPlace<T> for ToyPlace<'a, T> {
    type Owner = &'a mut T;
    unsafe fn finalize(self) -> &'a mut T {
        println!("InPlace::finalize");
        (self.toy_arena.buffer.as_mut_ptr() as *mut T).as_mut().unwrap()
    }
}
{% endhighlight %}

{% highlight rust %}
fn main() {
    let mut toy_arena = ToyArena { buffer: [0u8; 512] };
    let x: &mut f32 = &mut toy_arena <- 10.0f32;
    println!("x = {}", x);
    *x = 15.0;
    println!("x = {}", x);
}
{% endhighlight %}

[ToyArena on playground](https://play.rust-lang.org/?gist=37ddbf013b7da6cc61df3f6ed9a439bc&version=nightly&backtrace=0)

# 3. The light\_arena Library

Go through description of the impl.

## 3.1. Memory Blocks

this is pretty standard stuff, go quick

## 3.2. Ensuring Single Access

Talk about the mut borrow the allocator takes of the arena, this lets
us ensure at compile time only one user of the arena for allocations at a time.
Also talk about the Drop impl for the allocator.

## 3.3. Validating Allocation Lifetimes

The key part, how do we combine Rust's lifetimes and PhantomData in our
memory arena to ensure the lifetimes of objects and the arena are respected.

