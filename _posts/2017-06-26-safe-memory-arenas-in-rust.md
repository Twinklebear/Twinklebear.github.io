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

The crate built using the concepts described in this post is
[light\_arena]() which is available on crates.io and Github. Unfortunately
the placement in syntax and placement new features in Rust are still
experimental, meaning this crate requires nightly Rust.

