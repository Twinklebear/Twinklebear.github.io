class: center, middle

![](rust-logo-blk.svg)
# A Taste of Rust
Will Usher

???

Hey, I'm Will Usher and will hopefully convince some of you that Rust is really
cool and worth being excited about

This talk might have turned out a bit long, so just a warning but definitely
don't hesitate to jump in with questions

---

# What's the Deal With Rust?

- A systems programming language (think C++ and C)

- Enforces memory and thread safety

- Incorporates higher level language features

- Focuses on zero-overhead abstractions

- Compiles to fast native code

```rust
fn main() {
    let lab = "Los Alamos";
	println!("Hello {}!", lab);
}
```

???

Rust's goal is to enable you to write safer, higher level code but still target the
same landscape and performance as C++ and C.

Rust focuses on memory and thread safety, which means we prevent data races,
dangling pointers, use after free, iterator invalidation and so on.

We also want to write higher level code, Rust incorporates some elements from
functional languages to this end as we'll see later

To target the same performance as C++ we need zero-overhead abstractions, in the C++ sense of the term.
Abstractions will come at some cost but we want that price to be as small as possible.
To this end Rust has no runtime environment, similar to C++,
for example there's no garbage collector.

Rust also performs quite well and makes use of LLVM as its backend giving us
access to a very powerful optimizer to speed up our code

At the bottom here we have our first look at some Rust code, a slight variant on hello world,
to show a few Rust features.

**Mention:** let declarations, main as entry point, `{}` formatting and
println! macro.

---

# Cool Rust Features

1. Ownership and Lifetime System

2. Traits for Generics and Dynamic Dispatch

3. Enum Variants

4. Lazy Iterators and Closures

5. Easy Interoperability with C (and beyond!)

6. Helpful Community

7. Excellent Tooling

???

Here's the list of top cool Rust features that I hope will get you interested, and will be
what I'll try to cover in the talk

1. The ownership and lifetime system is how Rust achieves memory safety at compile time and
is really important to how the language works, so we'll spend a decent portion of the talk
on it

2. Traits are very roughly similar to interfaces in Java or abstract base classes in C++,
but can also be used for compile time generics in a manner similar to C++ templates,
making them far more powerful

3. You may know enum variants as tagged unions and in Rust they're used to get rid of null
pointers and cleanly handle errors, among other things. If you haven't heard of tagged
unions or variants before we'll cover them in more detail later

4. Lazy iterators combined with closures give Rust flexible and fast functional elements
that let you write clean and concise code

5. Since Rust aims to be where C and C++ are today easy interoperability with C is
really important and as we'll see later Rust can both call and be called from C
without any setup or teardown

6. Community around a language can be overlooked when looking at new languages but it's
an important feature if you plan to use the language a lot, and Rust has a great community

7. Rust also has a good toolchain that covers building, testing, benchmarking, generating
documentation and managing dependencies. Depending on how long everything else
takes we may or may not get to these slides, so they're kind of bonus ones if we've got time.

---

.left-column[
## Ownership & Lifetimes
### - Ownership
]
.right-column[
A variable binding owns the object it is bound to

Here x is the owner of the array
```rust
let x = [1, 2, 3, 4];
```

When the variable owning an object goes out of scope, the object is destroyed
```rust
fn foo() {
	// vec! creates a vector and fills it with values
	let y = vec![1, 2, 3, 4];
} // y owns the vec and goes out of scope,
  // thus the vector's memory is released here
```
]

???

Every object is owned by the variable it's bound too and an object can only
have one owner at a time

The compiler tracks the owner of an object and inserts the appropriate cleanup
call when it goes out of scope, similar to destructors in C++

It's important to note that the ownership and lifetime system is not like scopes
in C++ or Java or such though

---

.left-column[
## Ownership & Lifetimes
### - Ownership
]
.right-column[
Ownership of an object can be transferred to a new variable by moving it
```rust
let a = vec![1, 2, 3, 4];
// Now b is the owner of the Vec instead of a
let b = a;
```
Each object can have *only one* owner at a time

What if we tried to use a after moving the vector to b?
```rust
println!("a[0] = {}", a[0]);
```

We get a compilation error!
```
error: use of moved value: `a`
println!("a[0] = {}", a[0]);
					  ^
```
]

???

Ownership of an object can be transferred to a new variable by moving it, but as I mentioned
previously an object can only have one owner. So what happens if we try to use a after moving
the vector to b?

It's a compilation error!

Go to demo of the compile error on [playground](http://is.gd/ctVI4l)

Also change the code to show that ownership != scope because we can move ownership to a new
scope and thus preserve the object

---

.left-column[
## Ownership & Lifetimes
### - Ownership
]
.right-column[
We can also transfer ownership to functions allowing us to pass large objects without copying any data

```rust
fn foo(v: Vec<f32>) {
	// Do cool stuff with v
} // v goes out of scope and is free'd

fn main() {
	let v = vec![1.0, ....];
	// Ownership is passed to foo, no copy is made
	foo(v);
	// Trying to use v past here is a compile error
}
```

We can also pass ownership of an object back to the caller
```rust
fn foo() -> Vec<f32> {
	let v = vec![1.0, ....];
	// Ownership is passed to the caller, v is not free'd
	// and no copy is made
	v
}

fn main() {
	let v = foo();
}
```
]

???

Of course we'll also want to call functions and pass parameters and return data, which we
can do by moving. Note that in these cases no copy is made of the vector, the ownership of it is
transferred to the new scope.

---

.left-column[
## Ownership & Lifetimes
### - Ownership
]
.right-column[
Types in Rust are no-copy by default, since we can move them instead

Sometimes we do want a copy though, and two traits are provided to make types copy-able or clone-able,
depending on their properties

### Copy
Types that are trivially copy-able by simply copying bits.

Ex: integers, floats

### Clone
Types that are not trivially copy-able, they may have pointers to data or so on.

Ex: vectors, reference counted pointers
]

???

Because Rust has these powerful move semantics types are non-copyable by default, so
there isn't a compiler generated copy constructor like in C++ that can bite you.

However sometimes a copy is what we want, and there are two traits available that you can
implement for your type as appropriate. Usually the compiler is able to figure this out
and you can place a declaration above your type to have it generate these for you.

Copy is for types that are trivially copy-able by just copying their bits, like
floats, integers and so on

Clone is for more complicated types, maybe they have some pointer they manage internally so
types like vectors, reference counted pointers

---

.left-column[
## Ownership & Lifetimes
### - Ownership
### - Borrowing
]
.right-column[
Often we just want a temporary reference to an object, in Rust this is referred to as 'borrowing'

```rust
// Here v is a borrowed Vec of 32-bit integers
fn first_even(v: &Vec<i32>) -> bool {
	v[0] % 2 == 0
}

fn main() {
	let v = vec![1, 2, 3];
	// Borrow v and pass the borrow to the function
	if first_even(&v) {
		println!("v[0] = {} is even", v[0]);
	} else {
		println!("v[0] = {} is odd", v[0]);
	}
}
```
]

???

A lot of times we really just want a temporary reference to an object so we
can do some operation on it. In Rust this is referred to as borrowing.

In this program we really don't want to hand ownership over to first_even,
we just want to lend it for a little bit to get the result, so we pass
a borrowed Vec.

Go to [demo](http://is.gd/Z4KUO0)

---

.left-column[
## Ownership & Lifetimes
### - Ownership
### - Borrowing
]
.right-column[
There are certain restrictions on borrowing to enforce memory safety:

- An object may not be moved or modified while it is borrowed

- An object may not be simultaneously mutably and immutably borrowed

- An object can only be mutably borrowed once at any time

```rust
let x = vec![1, 2, 3];
let y = &x;
let z = x; // We can't move x while it's borrowed!
```

```rust
let mut x = vec![1, 2, 3];
let y = &mut x;
let z = &x; // This is a compile error!
			// x is mutably borrowed at the moment
```
]

???

There are some restrictions on borrowing to enforce memory safety.
An object can't be moved or modified while borrowed, it can't be
simultaneously mutably and immutably borrowed, and it
can only be mutably borrowed once at any time.

These restrictions help prevent data races and dangling references, and make
sense if you think of how borrowing works in reality. If I lend you a table
but then sneak over and take it back without telling you, it's understandable
that you'd be annoyed.

Show demos of compile errors.

[move borrowed object](http://is.gd/2msbBB)

[mutably borrow an immutable borrowed object](http://is.gd/pXIfhV)

**Also mention:** immutable by default on this slide, it will be the first place people see mut in examples.

---

.left-column[
## Ownership & Lifetimes
### - Ownership
### - Borrowing
### - Lifetimes
]
.right-column[
What do we mean by an object's lifetime?

An easy way to visualize it is to think about scopes of variables

```rust
fn main() {
	let x = 10;    // -+ x goes into scope
	{              //  |
		let y = 5; // ---+ y goes into scope
        ...        //  | |
	}              // ---+ y goes out of scope
	...            //  |
}                  // -+ x goes out of scope
```
]

???

When we talk about the lifetime of an object, we really just mean: how long is a reference to this
object valid?

In this example if we think about having a reference to x and y in this program, we can
see when each reference would become invalid, since the object has gone out of scope.
I've used this to plot the lifetime of each object here.

---

.left-column[
## Ownership & Lifetimes
### - Ownership
### - Borrowing
### - Lifetimes
]
.right-column[
A borrow has an implicit lifetime associated with it, since a borrow is only valid as long
as the borrowed object is alive

Rust's borrow checker uses lifetime information to statically check the validity of borrows

```rust
fn main() {
	let x = 10;
	let &y;
	{
		let z = 20;
		y = &z;
	}
}
```

This code creates a dangling reference, the borrow checker can see this and
we get a compile error!

```
error: `z` does not live long enough
		y = &z;
			 ^
```
]

???
The borrow checker is key to how Rust enforces memory safety at compile time. By using
information about ownership and lifetimes the compiler is able to check the validity
of references in Rust code, and give a compilation error when it finds invalid ones.

This of course works on more complicated code than our small example here

In this example I attempt to create a dangling reference to z, whose lifetime is shorter than
the reference variable

Go to [compile error demo](http://is.gd/bLLMRk)

---

.left-column[
## Ownership & Lifetimes
### - Ownership
### - Borrowing
### - Lifetimes
]
.right-column[
Often the compiler can elide lifetimes of borrows, but sometimes it's not so easy

In some cases we'll need to help it out by introducing an explicit lifetime variable

```rust
struct Foo<'a> {
	val: &'a f32,
}
```
```rust
fn main() {
	let x = 3.14;
	let foo = Foo { val: &x };
	println!("foo.val = {}", foo.val);
}
```
]

???

In most situations the compiler can figure out the lifetimes associated with borrows
but sometimes it's not so easy, and we need to be more explicit about the lifetimes in
our code.

[Foo demo](http://is.gd/ULns4L)

[Bar demo](http://is.gd/pvvkEs), here the compiler is able to see
that the borrow we return shares the lifetime with the object

We also get a few new keywords here, struct introduces a new structure definition and impl
introduces a new implementation of functions for a type. More on this on the next slide.

---

.left-column[
## Traits
]
.right-column[
Traits are similar to interfaces in Java, or abstract base classes in C++, however
traits in Rust provide much more powerful functionality

Let's define a basic trait, and implement it for some simple structs
```rust
trait Speaks {
	fn speak(&self);
}
```
```rust
struct Dog;

impl Speaks for Dog {
	fn speak(&self) { println!("Woof!"); }
}
```
```rust
struct Human {
	name: String,
}

impl Speaks for Human {
	fn speak(&self) {
		println!("Hi, I'm {}.", self.name);
	}
}
```
]

???

As a starting point for Rust traits you can think of interfaces in Java or abstract base classes in
C++ but as we'll see shortly traits in Rust are much more powerful than either of these language features.

**Talk:** About the code samples here. Trait defines a new trait, impl TraitName for StructName
implements a trait for a struct, etc.

---

.left-column[
## Traits
### - Generics
]
.right-column[
Rust provides generic method handling similar to templates in C++ but
also allows to specify constraints on the types by requiring certain traits
are implemented

Let's try to write a generic function that takes any type and makes it speak

```rust
fn say_hello<T>(speaker: &T) {
	speaker.speak();
}
```

Oh no! The compiler doesn't know that T implements the method
we're trying to call, and gives us an error

```
error: type `&T` does not implement any method in scope named `speak`
     speaker.speak();
             ^~~~~~~
```
]

???

Rust provides support for generic methods sort of similar to templates in C++, but with the
trait system we can actually place constraints on the types these functions accept. Since we
can place constraints like this the compiler can also give us much better feedback on type errors
in generic functions.

Here's a generic function with a problem. We're trying to write something that will take any type
and call speak on it, but the compiler knows that not every type implements such a method and
gives us an error.

---

.left-column[
## Traits
### - Generics
]
.right-column[
We can use the trait we defined to place a constraint on the types that our generic function
will operate on

Here we specify that the type T must implement Speaks

```rust
fn say_hello<T: Speaks>(speaker: &T) {
	speaker.speak();
}
```

Just like with templates in C++ a version of say_hello is generated for each type we
pass, allowing us to avoid virtual function calls
```rust
fn main() {
    let dog = Dog;
    let human = Human { name: str::to_string("Will") };
    say_hello(&dog);
    say_hello(&human);
}
```
]

???

Instead we must constrain the types that our function will accept so that it will only
take those that implement the Speaks trait. Now the compiler knows this is ok because it
can verify the Speaks trait does have this method and will compile our code.

Just like with templates in C++ a version of this function is generated for each type
we call the function on and there are no virtual function calls made.

Go to [demo](http://is.gd/CVwrfT)

---

.left-column[
## Traits
### - Generics
]
.right-column[
What if we pass a type that doesn't satisfy the function's constraints?

```rust
fn main() {
    let x = 10.5f32;
    say_hello(&x);
}
```

The compiler gives us a much more readable error than we would get
with a bad C++ template instantiation

```
error: the trait `Speaks` is not implemented for the type `f32`
     say_hello(&x);
     ^~~~~~~~~
```

]

???

The flip side of this constraint is that we also get much better feedback as a user of the function
if we pass the wrong type. Since the function specifies that all types it takes must implement
Speaks the compiler can give us an error at the bad call site instead of inside the template function,
and tells us that our type doesn't meet the function's constraints.

---

.left-column[
## Traits
### - Generics
]
.right-column[
We can even combine type constraints, requiring that multiple traits be implemented by the
types passed to our generics

```rust
fn foo<T: Speaks + Runs>(critter: &T) {
	...
}
```

Rust also provides generic structs, and we can use type constraints here as well
```rust
struct Foo<T: Speaks + Runs> {
	critter: T,
}
```

]

???

We can also combine constraints on generic functions to require that multiple traits
be implemented for the type being passed, as we do here.

Rust also provides generic structs which function similar to template classes or structs
in C++ but we can also specify the same constraints there too.

---

.left-column[
## Traits
### - Generics
### - Dynamic Dispatch
]
.right-column[
We can also use traits to generate virtual function calls, as you would encounter in Java
or with virtual functions in C++

To do this we take a borrow of the trait we want to operate on

```rust
fn say_hello_dynamic(speaker: &Speaks) {
	speaker.say_hello();
}
```

```rust
fn main() {
    let dog = Dog;
    let human = Human { name: str::to_string("Will") };
    say_hello_dynamic(&dog as &Speaks);
	// The cast isn't actually required
    say_hello_dynamic(&human);
}
```
]

???

Traits can also be used as you'd usually use interfaces or abstract base classes to
make virtual function calls. This is done by taking a borrow of the trait and here
a virtual function table will be generated and used instead of static dispatch like
we got in our generic functions.

The cast is shown in this example just to show what type casting looks like in Rust and
isn't actually required here.

Go to [demo](http://is.gd/Sger74)?

---

.left-column[
## Enums
]
.right-column[
Enums represent data that can be one of several variants

```rust
enum Color {
	RGB(f32, f32, f32),
	XYZ(f32, f32, f32),
	HSV(f32, f32, f32),
}
```

We can match and destructure enums based on the type to handle the variants appropriately
```rust
match color {
	RGB(r, g, b) => ....,
	XYZ(x, y, z) => ....,
	HSV(h, s, v) => ....,
}
```

Enums are used to get rid of null pointers and handle errors
]

???

Enums represent data that can be one of several variations, you may have heard
them referred to as 'tagged unions' or 'variants'. In this example we have 3
possibilities for representing a color value, depending on what color space we have
it in, RGB, XYZ or HSV. In order to figure out what variation we've got we can
use a match expression, within which we can also destructure the enum to get
the values for each color channel.

As we'll see in a moment enums also allow us to get rid of null pointers and cleanly
handle errors.

Also mention that the variations don't need to be the same size.

---

.left-column[
## Enums
### - No Null
]
.right-column[
The Option enum is used to represent a value that may or may not exist

```rust
enum Option<T> {
	None,
	Some(T),
}
```

Any variable that may be null in another language must now explicitly be an option,
making the intent clear

To get a value out of an option we can match on it

```rust
let v = match opt {
		Some(v) => v,
		None => // Do something, eg. create default or abort
	};
```

If aborting the program on a None is desired, we can use unwrap, which will call
panic! if the Option is None
```rust
let k = opt.unwrap();
```
]

???

Instead of null pointers we make use of the Option type, which can be either None or Some(T). This
makes the possibility that their might not be something there clear to the programmer and forces
them to explicitly handle it in some way. It's not possible to randomly pass null to any pointer
variable (eg. like in Java) and crash things. To handle the Option type we can match on it like
before and fail gracefully if we get None, or we can call unwrap and let the program abort if nothing
is there.

---

.left-column[
## Enums
### - No Null
### - Error Handling
]
.right-column[
Errors are handled using the Result enum, which can be either the computed
result or an error type
```rust
enum Result<T, E> {
	Ok(T),
	Err(E),
}
```

Handling of the Result type behaves similary to Option, but instead of None we get information about what
went wrong
```rust
match thing_that_can_error() {
	// T = (), no value returned but can error
	Ok => println!("Everything looks good!"),
	Err(e) => println!("Error {:?} occured!", e),
}
```
]

???

Error handling behaves very similar to the Option type, except that our error type now an come with
an error value of some kind. This could be an error code, or message, or whatever. It's also possible
for either or both of these types to be the unit type, which is sort of similar to void. In this example
the function does some operation that can error but the operation doesn't return a value, so we have
a result with the unit type on Ok and an error string on Error. Handling is again done with matching.

---

.left-column[
## Iterators & Closures
### - Iterators
]
.right-column[
Many operations in Rust are based on iterators
- Applying a function to a list
- Filtering a list based on some predicate
- Zipping two lists together

Rust's for loop uses iterators as well

The statement `0..5` creates an iterator that will yield the values 0, 1, 2, 3, 4

```rust
for i in 0..5 {
	println!("iteration {}", i);
}
```

As we'd expect, this prints
```
iteration 0
iteration 1
iteration 2
iteration 3
iteration 4
```
]

???

An iterator in Rust provides a method called next which will give the next item
in the sequence being iterated over. This sequence doesn't have to actually be in
some container though, it could be a generated one like the Fibonacci sequence.

Iterators in Rust are very flexible and a lot of operations are built using them

- applying a function to a list
- filtering a list on some predicate
- zipping lists together
- and so on

Rust's for loop is actually even based on iterators. The expression m..n creates
an iterator that will yield elements m through n-1. In this example we create an
iterator to give us the values 0 through 4 and print each one in a loop.

---

.left-column[
## Iterators & Closures
### - Iterators
]
.right-column[
How do we know when to stop?

An iterator returns an `Option<T>` type, which can be one of:
- `Some(T)` - There is a valid value here that we can use
- `None` - There is no value here, the iterator has terminated

So what does our for loop really look like under the hood?
```rust
let mut iter = 0..5;
loop {
	match iter.next() {
		Some(x) => println!("iteration {}", x),
		None => {
			println!("We're done here");
			break;
		}
	}
}
```
]

???

One question left to ask having seen the for loop on the previous slide, is how do we know
when to stop? The iterato'rs next method actually gives us an Option result, the iterator
will return Some value until we hit the end of the sequence and from then on it returns None.

So our for loop is really something more like this: We have an iterator over the sequence
we want to loop over, then go over it in an infinite loop with the loop structure and
then call next each step. If we get some we print out the value, if we get none we break.

It's also very important to mention that you can define your own iterators that can
generate whatever sequences or operations on sequences you want.

Go to [demo](http://is.gd/e3VP0W)

---

.left-column[
## Iterators & Closures
### - Iterators
### - Lazy Iterators
]
.right-column[
Iterators in Rust are lazy, no operations are actually performed until we need the result
- ie. when you call next on the iterator to get the next value

What should we expect the output to be here?

```rust
for i in (0..5).map(|x| { println!("iter {}", x); x }) {
	println!("loop {}", i);
}
```
]

???

Another really important feature of iterators is that they're lazy. This means that
no work is actually performed to compute the value to return until you actually call
next, so there's no intermediate storage overhead or big computation that might occur.

This example demonstrates the lazyness of iterators and how it works. What would we expect
the output to be here? Without lazy iterators we'd expect to see iter 0..5 printed and then
loop 0..5 but with lazy iterators we'd expect this prints to be interleaved.

Go to [lazy demo](http://is.gd/pY86Hg)

---

.left-column[
## Iterators & Closures
### - Iterators
### - Lazy Iterators
### - Closures
]
.right-column[
A closure is a function we can store in a variable and pass around that can capture variables
in its environment

```rust
let x = 10;
let c = |y| { println!("x * {} = {}", y, x * y); };
c(5);
```

Closures can also be passed as parameters to functions

```rust
fn foo(f: &Fn(i32)) {
	f(8);
}

fn main(){
	let x = 10;
	let c = |y| { println!("x * {} = {}", y, x * y); };
	foo(&c);
}
```
]

???

Rust also has support for closures, a closure is a function that can capture
variables in its environment and reference them. They can additionally be stored
in variables and called or passed around as arguments.

I kind of snuck it in to demonstrate the lazyness of iterators on the previous
slide, although we didn't capture anything, but now we'll combine iterators
and closures and things get really cool.

Go to [closure demo](http://is.gd/moT3nB)

---

.left-column[
## Iterators & Closures
### - Iterators
### - Lazy Iterators
### - Closures
### - Unleash the Power!
]
.right-column[
Combining closures and iterators allow us to write powerful operations elegantly

```rust
let v = vec![1, 20, 2, 19, 3, 18, 4, 17, 5, 16];
let x = 10;
let r: Vec<_> = v.iter().filter_map(|y| {
	if *y < x {
		Some(y * 3)
	} else {
		None
	}
}).filter(|x| x % 2 == 0).collect();

println!("r = {:?}", r);
```
]

???

We're able to use the Map or FilterMap iterator to apply a closure to a sequence
and get the result and are able to chain iterators together to apply multiple operations
to the sequence.

In this example we take a vec and use filter map to only pass on values that are less then
x and multiply them by 3, then we apply a second filter to take only even values and finally
collect the results into a vec, which we then log out using debug printing.

This is kind of a contrived example but starts to hint at what we can achieve with
lazy iterators and closures that we can chain together.

Go to [demo](http://is.gd/WdeQDu)

---

.left-column[
## Interop with C
### - Calling C
]
.right-column[
A lot of code is written in C, or provides a C-callable interface so being able to call C
from Rust is very useful

Let's try calling a simple C function in a static library
```c
int call_c(int v){
	printf("Hello from C!\n");
	return v * 5;
}
```

To call some C library we can use the libc crate and an extern block
```rust
extern {
    fn call_c(v: libc::c_int) -> libc::c_int;
}
// It's best to make a safe wrapper around the FFI calls
fn safe_wrapper(v: i32) -> i32 {
    unsafe { call_c(v) }
}

fn main() {
    let output = unsafe { call_c(10) };
    println!("output from c = {}", output);
    let safe_out = safe_wrapper(20);
    println!("output from safe wrapper = {}", safe_out);
}
```

]

???

Because Rust wants to work in the same space as C and C++ good interopability with C is
very important. Let's suppose we have some silly static lib in C that we want to call
a function in. We can create an extern declaration of the function in our Rust program
using the libc types and then call it directly.

There is something new here though, because the Rust compiler doesn't know what's going on
in the C code it needs to be marked unsafe since the compiler can't make any guarantees.
An unsafe block is the our way of telling the compiler, "hey I'll make sure this is all ok"
within unsafe code you can do any of the crazy stuff you'd normally do in C and the compiler
won't complain, but it's up to you to make sure things are in a safe state upon leaving the block.

The preferred way is to write a safe wrapper around the C function that internally calls the unsafe
code and provides a safe interface to it.

**Show** Demo of this compilation if time.

---

.left-column[
## Interop with C
### - Calling C
### - C Calling
]
.right-column[
It's also possible to call into Rust from C, allowing Rust to be used anywhere a C library
or C-callable code is used (ie. call from Python, Ruby, etc.)

We can write static and dynamic libraries in Rust that provide a C-callable interface
```rust
#[no_mangle]
pub extern fn call_rust(v: i32) -> i32 {
    println!("Hello from Rust!");
    v * 4
}
```

We then declare the function as extern and link against the static lib we built
```c
extern int32_t call_rust(int32_t v);

int main(){
	printf("result from Rust = %d\n", call_rust(20));
	return 0;
}
```
]

???

It's also important that Rust can be called from C, since we'd like to be usable in place
of C and C++ but will have to interop with a lot of existing code. Since Rust doesn't have
a GC or runtime we can call into Rust from C without any setup code, it's exactly like calling
a C function.

To export a C function we label it with the `#[no_mangle]` directive to instruct the compiler
not to mangle the name and mark it extern to make the function compatible with a C function call.
We then can compile this into a static lib and link the below C program against it to call the function.

**Show** Demo of this compilation if time.

---

## Community

- **Learn Rust!** [doc.rust-lang.org/book](https://doc.rust-lang.org/book)

- Homepage: [rust-lang.org](http://www.rust-lang.org) (also has links to the book and docs)

- IRC: irc.mozilla.org, channel: #rust

- [reddit.com/r/rust](https://www.reddit.com/r/rust), [@rustlang](https://twitter.com/rustlang)
on Twitter, [users.rust-lang.org](https://users.rust-lang.org/)

- Get the source! [github.com/rust-lang/rust](https://github.com/rust-lang/rust)

- Weekly Rust news: [this-week-in-rust.org](http://this-week-in-rust.org)

The community is really kind and helpful and is a great resource when learning and using the language

> "The Rust community seems to be populated entirely by human beings.
I have no idea how this was done." — *@jamiiecb*

---

class: center, middle

![](rust-logo-blk.svg)
# Questions?

???

Ask for any questions and go back to leave it up on the community page in case anyone is writing the
URLs down. Also mention that the slides will be up on my site as well.

---

.left-column[
## Tooling
### - Testing
]
.right-column[
Rust comes with built in support for testing, a function can be marked as a test with `#[test]`

We can then build a test harness executable with `rustc --test`

```rust
fn adder(a: i32, b: i32) -> i32 {
    a + b
}

#[test]
fn test_adder() {
    assert!(adder(10, 5) == 15);
    assert_eq!(adder(2, 4), 6);
}
```

Running the test harness will run all our tests and print out information about
those that passed and failed
```
running 1 test
test test_adder ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```
]

???

Run demo of the failing tests as well, in test_ex.rs

---

.left-column[
## Tooling
### - Testing
### - Docs
]
.right-column[
Rust comes with a built in tool and syntax for generating documentation

```rust
//! Module docs at the top with a `//!`

/// Struct, Trait and fn docs are done with `///`
///
/// # Example
/// rustdoc also builds your examples to make sure they stay
/// up to date with your library. *Markdown* syntax
/// is used in the docs
///
/// ```\// The trailing slashes are only for the slide parser
/// let x = docs_ex::DocEx { x: 1.0 };
/// ```\
pub struct DocEx {
    /// You can also doc members
    pub x: f32,
}

/// Some trait docs
pub trait DocTrait {
    /// Documented fn example
    fn doc_me(x: f32);
}
```
]

???
Show running rustdoc and opening the generated doc page

Maybe go to [tobj docs](http://www.willusher.io/tobj/tobj/) and show doc tests on tobj?

---

.left-column[
## Tooling
### - Testing
### - Docs
### - Cargo & Crates.io
]
.right-column[
Cargo is a tool used to manage your project's dependencies to ensure reproducible builds
and make building projects easier

crates.io is the languages' central package repository where most packages will be downloaded from
(directly cloning a git repos is also supported)

```toml
[package]
name = "hello_lanl"
version = "0.0.1"
authors = ["Will Usher <wusher@lanl.gov>"]

[dependencies]
glium = "*"
glutin = "*"
tobj = "0.0.9"

[dependencies.color]
git = "https://github.com/bjz/color-rs.git"
```

After building Cargo locks the versions of dependencies in a Cargo.lock file, so others
will download the same versions of libraries you built with
]

