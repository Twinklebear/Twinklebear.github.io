---
title: 'Building, Shipping and Debugging a C++ WebAssembly App'
date: 2024-06-11
layout: post
tags: [webassembly, C++]

---

[WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) (WASM) is an exciting, and now practically ubiquitous, browser technology that allows for compiling code from a number of languages to run at near-native speed in the browser. Native languages, such as C, C++, Rust, and Zig can be compiled to WASM to accelerate computationally intensive tasks in web applications or to port entire native applications to the browser. Even garbage collected languages such as C# and Go can be compiled to WASM to run in the browser. Support for WASM can be assumed in all [relatively modern browsers](https://caniuse.com/?search=webassembly), and more applications have begun leveraging it, from early adopter Figma to Google Sheets.

In this post, we’ll look at how to build, ship, and debug a C++ WASM application that is integrated into a TypeScript or JavaScript frontend application. This is a similar model to [Figma](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/), where the UI components are written in React (or your framework of choice), while all heavy computation and non-UI rendering work is owned by a WASM module written in a native language for performance. Inigo Quilez’s [Project Neo at Adobe](https://projectneo.adobe.com/) appears to have a similar design, based on digging through a performance trace in Chrome, and what I’ve been working on at [Luminary Cloud](https://www.luminarycloud.com/) follows a similar architecture. To do this, we need to integrate our WASM module into frontend bundlers like [Webpack](https://webpack.js.org/), maybe through an npm module, and think about API designs for efficiently coupling TypeScript and C++ WASM modules (though we won’t have time for npm modules and API discussion in this post).

<!--more-->

As an aside, if you’re solving exciting problems working on an application with this structure I’d love to hear from you to learn about what you’re doing! Besides Figma’s excellent technical blogs and this talk by [Joey Liaw about Figma’s C++ engine](https://www.youtube.com/watch?v=opGoe7yHHkk), I’ve found relatively little information about designs, best practices, etc. for such applications. You can get in touch with me by
email (<a id="email-link"><span id="email-text"></span></a>),
[Twitter](https://twitter.com/_wusher), [Mastodon](https://mastodon.social/@willgfx), or [Linkedin](https://www.linkedin.com/in/will-usher/).

If you’re building a more typical Emscripten application with a full-page canvas where all UI and rendering is handled by C++ (e.g., a game, or porting a fully native app), the debugging workflow discussed here is still relevant, but you can skip the Application Structure and Deploying w/ Webpack sections as they may not be relevant. You will likely also find Andre Weissflog’s post on [WASM Debugging with Emscripten and VSCode](https://floooh.github.io/2023/11/11/emscripten-ide.html) helpful, which is where I first learned about debugging WASM with VSCode.

# Example Application Structure

The example app ([github.com/Twinklebear/build-ship-dbg-wasm](https://github.com/Twinklebear/build-ship-dbg-wasm)) we’ll use is a mini app representative of those mentioned above, where we have some C++ code that is integrated into a frontend app written in a typical frontend language and framework. The example app has two parts:

1. The C++ code that we’ll compile to WASM with Emscripten.
2. A TypeScript web app using Webpack that imports our WASM and calls it.

To keep things simple in the example app, we’ll just have our C++ build process copy the compiled WASM into the web app source code. Copying the WASM over could work in a monorepo environment, where your C++ and frontend code are in the same repo. In cases where you have separate repos, you could publish your WASM code as an npm module that your frontend application imports. I won’t cover building C++ to an npm module in this post, but maybe in a future one.

Our C++ code lives under `src/` and our TypeScript frontend app lives under `web/` . We have a top-level `CMakeLists.txt` that just calls down to our `src/CMakeLists.txt`. Under `web/` we have the regular config files for a TypeScript Webpack app, package.json, tsconfig.json, webpack.config.js, and the HTML file for our app page. The web app source code is under `web/src/` . We also include a type definition file for WASM files, `wasm.d.ts`, so TypeScript can import it without complaining about missing type information.

```text
CMakeLists.txt
src/ -> Our C++ code is here
	CMakeLists.txt
	main.cpp
web/ -> Our TypeScript frontend app is here
	index.html
	package.json
	tsconfig.json
	webpack.config.js
	src/ -> TypeScript app source code
		index.ts
		wasm.d.ts
```

## Build and Run Process

The build and run process for the app is:

- Compile the C++ code with Emscripten and copy the compiled WASM to the web app
- Run or deploy the web app using Webpack

Let’s look into these steps in detail to see how to build and run the app.

# Building the C++ Code with Emscripten and CMake

The example app is pretty simple. It gets a WebGL2 context for the canvas and runs a loop that changes the canvas’s color each frame. This isn’t much, but it gives us enough interesting work to practice debugging a WASM application with VSCode. We’ll be able to set breakpoints in the loop and inspect local and global variables that change each frame to see that our build pipeline and debug setup are working.

`main.cpp` contains the following:

```cpp
#include <array>
#include <cstdint>
#include <iostream>

#include <GL/gl.h>
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>

// Utility to convert an HSV color to RGB
std::array<float, 3> hsv_to_rgb(const std::array<float, 3> &hsv);
// Our main app loop run each frame
void app_loop(void *);

int main(int argc, const char **argv)
{
    // Setup the WebGL2 context
    EmscriptenWebGLContextAttributes attrs = {};
    emscripten_webgl_init_context_attributes(&attrs);
    attrs.minorVersion = 0;
    attrs.majorVersion = 2;
    attrs.explicitSwapControl = false;

    // Our canvas ID is just "canvas" in web/index.html
    const auto context = emscripten_webgl_create_context("#canvas", &attrs);
    emscripten_webgl_make_context_current(context);

    // Start the app loop
    emscripten_set_main_loop_arg(app_loop, nullptr, -1, 0);

    return 0;
}

uint32_t hue = 0;

void app_loop(void *)
{
    // Update the hue to change the color this frame
    hue = (hue + 1) % 360;
    const auto rgb = hsv_to_rgb({static_cast<float>(hue), 0.8f, 0.8f});

    glClearColor(rgb[0], rgb[1], rgb[2], 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
}

std::array<float, 3> hsv_to_rgb(const std::array<float, 3> &hsv)
{
    std::array<float, 3> rgb = {0.f};

    const float sector = std::floor(hsv[0] / 60.f);
    const float frac = hsv[0] / 60.f - sector;
    const float o = hsv[2] * (1.f - hsv[1]);
    const float p = hsv[2] * (1.f - hsv[1] * frac);
    const float q = hsv[2] * (1.f - hsv[1] * (1.f - frac));

    switch (int(sector)) {
    default:
    case 0:
        rgb[0] = hsv[2];
        rgb[1] = q;
        rgb[2] = o;
        break;
    case 1:
        rgb[0] = p;
        rgb[1] = hsv[2];
        rgb[2] = o;
        break;
    case 2:
        rgb[0] = o;
        rgb[1] = hsv[2];
        rgb[2] = q;
        break;
    case 3:
        rgb[0] = o;
        rgb[1] = p;
        rgb[2] = hsv[2];
        break;
    case 4:
        rgb[0] = q;
        rgb[1] = o;
        rgb[2] = hsv[2];
        break;
    case 5:
        rgb[0] = hsv[2];
        rgb[1] = o;
        rgb[2] = q;
        break;
    }
    return rgb;
}
```

Our `src/CMakeLists.txt` passes a number of link arguments to Emscripten, and contains a custom command and target to copy the Emscripten build outputs into `web/src/cpp` , where our TypeScript code can import it. There are a few key link options we set on the `app` target that allow us to easily import our WASM code as a module in the TypeScript app (e.g., `import CppApp from ./cpp/app.js`). Stepping through each individually:

- `"SHELL:-sENVIRONMENT='web'"`: We’re only targeting the web and can thus restrict the target environments to reduce the compiled Emscripten JS wrapper size ([docs](https://emscripten.org/docs/tools_reference/settings_reference.html#environment)).
- `EXPORT_ES6`, `EXPORT_NAME=CppApp`: Emscripten will output both a WASM file and a JS file that imports the WASM and sets up the rest of the runtime environment and exported functions needed to run the code in the WASM file. These flags tell Emscripten that we want this JS file to be an ES6 module, with the exported name `CppApp`. (docs on [`EXPORT_ES6`](https://emscripten.org/docs/tools_reference/settings_reference.html#export-es6) and [`EXPORT_NAME`](https://emscripten.org/docs/tools_reference/settings_reference.html#export-name)).
- `MIN_WEBGL_VERSION` and `MAX_WEBGL_VERSION`: Tell Emscripten which WebGL version we want to target, we just want WebGL2 so both are set to 2. ([docs](https://emscripten.org/docs/tools_reference/settings_reference.html#min-webgl-version))
- `ALLOW_MEMORY_GROWTH`: We want support for dynamic allocations that can grow the memory size of the app. ([docs](https://emscripten.org/docs/tools_reference/settings_reference.html#allow-memory-growth))
- `INVOKE_RUN`: We want control over when we start running the C++ code, which we may want to do after some other setup has been done. I also found that not disabling `INVOKE_RUN` caused some issues with errors or exceptions being caught inside Emscripten’s invoke run code, causing the debugger to miss them. We set this to 0 to manually call main later when appropriate in our app. ([docs](https://emscripten.org/docs/tools_reference/settings_reference.html#invoke-run))
- `"SHELL:-sEXPORTED_RUNTIME_METHODS='[\"callMain\"]'"`: Since we’ll be calling main ourselves, we need to tell Emscripten to export the runtime method `callMain` which we’ll use to call the main function to start our app.

There are some other flags that we only enable for Release + Debug Info (RelWithDebInfo) and full Debug builds. We want to ship an optimized binary with debug information in our app to be able to debug crashes that occur in production; however, the DWARF symbols can become quite large and we don’t want to ship them to our customers since they don’t need them. For RelWithDebInfo builds we enable `-gseparate-dwarf` to output the DWARF information to a separate file to reduce the WASM file size we while retaining the ability to reconstruct stack traces from the app. We’ll learn more about this in the section on debugging stack traces from production. For full debug builds we don’t enable separate dwarf because it prevents VSCode from finding our debug symbols (unless we load them separately in the app).

It’s important to call out a flag that we explicitly **do not** pass: `-gsource-map`. This flag enables will outputting a source map with LLVM debug information and can be used for some debugging in Chrome, but conflicts with DWARF symbol-based debugging. The latter is more powerful, allowing us to inspect variables as well, and so we don’t output source maps.

`src/CMakeLists.txt` contains:

```cmake
add_executable(app main.cpp)
set_target_properties(app PROPERTIES CXX_STANDARD 20 CXX_STANDARD_REQUIRED ON)

target_link_options(
  app
  PRIVATE
  "SHELL:-sENVIRONMENT='web'"
  -sEXPORT_ES6
  -sEXPORT_NAME=CppApp
  -sMIN_WEBGL_VERSION=2
  -sMAX_WEBGL_VERSION=2
  -sALLOW_MEMORY_GROWTH=1
  -sINVOKE_RUN=0
  # RelWithDebInfo build flags, enable separate dwarf
  # to reduce wasm file size
  $<$<CONFIG:RELWITHDEBINFO>:-gseparate-dwarf=${CMAKE_CURRENT_BINARY_DIR}/app.dwarf>
  $<$<CONFIG:RELWITHDEBINFO>:-g>
  $<$<CONFIG:RELWITHDEBINFO>:-O2>
  # Debug build flags
  $<$<CONFIG:DEBUG>:-fwasm-exceptions>
  $<$<CONFIG:DEBUG>:-g>
  $<$<CONFIG:DEBUG>:-O0>
  # Exported Emscripten runtime methods
  "SHELL:-sEXPORTED_RUNTIME_METHODS='[\"callMain\"]'")

# Custom command and target to copy our compiled WASM and JS
# files from the C++ build directory into the web app's source
# directory under web/src/cpp

set(WEB_OUT_DIR ${PROJECT_SOURCE_DIR}/web/src/cpp)

add_custom_command(
  DEPENDS app
  OUTPUT ${WEB_OUT_DIR}/app.js ${WEB_OUT_DIR}/app.wasm
  COMMAND cmake -E make_directory ${WEB_OUT_DIR}
  COMMAND cmake -E copy_if_different ${CMAKE_CURRENT_BINARY_DIR}/app.js
          ${CMAKE_CURRENT_BINARY_DIR}/app.wasm ${WEB_OUT_DIR})

add_custom_target(
  copy_wasm_to_app ALL
  DEPENDS ${WEB_OUT_DIR}/app.js ${WEB_OUT_DIR}/app.wasm
  COMMENT "Copying wasm build to ${WEB_OUT_DIR}")
```

After building our app we define a custom command and target `copy_wasm_to_app` . The custom command will make the output `web/src/cpp` directory in our web app’s source tree and copy the Emscripten outputs `app.js`  and `app.wasm` into it so that our frontend code can import them. Our custom target `copy_wasm_to_app` depends on this command to run it, and is added to the `ALL` target so that it will run as part of the regular build process.

When we build our app, it will be compiled with Emscripten to WASM and the outputs copied into our frontend app’s source tree to be imported by the frontend. It’s also possible to distribute the WASM code as part of an npm module if you’re not using a monorepo or want to distribute your WASM code through npm.

The top-level `CMakeLists.txt` file is simple, it just adds some warnings and adds our C++ source directory.

```cmake
cmake_minimum_required(VERSION 3.27)
project(build-ship-dbg-wasm)

if(NOT WIN32)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -pedantic")
endif()

add_subdirectory(src)
```

We can configure and build the C++ code using the `emcmake` wrapper, or you could setup `CMakeUserPresets.json` as [described by Andre Weissflog](https://floooh.github.io/2023/11/11/emscripten-ide.html). Assuming the Emscripten SDK is in your path (emcmake, emcc, etc.), you can run the following from the root of the repo directory to build the C++ code:

```text
mkdir cmake-build
cd cmake-build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Debug
cmake --build .
```

If you look in `web/src/cpp` you should now see `app.js` and `app.wasm`.

# Running and Deploying the TypeScript + WASM App with Webpack

Now that we’ve got our C++ code compiled to WASM and copied over to the web app source, we can import it into our TypeScript app. Our example frontend app is pretty simple as well, we just import the WASM module and call `callMain` to run our C++ main function. Since we have an ES6 module that we can easily import and call, we can integrate it with other frontend frameworks or larger existing frontend applications, etc., as we want.

```typescript
import CppApp from "./cpp/app.js";

(async () => {
  let app = await CppApp();

  try {
    app.callMain();
  } catch (e) {
    console.error(e.stack);
  }
})();
```

We also need a types file for the TypeScript compiler to know what’s in our `.wasm` files:

```typescript
declare module "*.wasm"
{
    const content: any;
    export default content;
}
```

For brevity I’ve omitted index.html, package.json and tsconfig.json. The index.html file just contains some boiler plate HTML and a canvas with `id="canvas"` , matching what our C++ code looks for when creating the WebGL2 context. The package.json and tsconfig.json are typical for any TypeScript Webpack app, all the files can be found on [Github](https://github.com/Twinklebear/build-ship-dbg-wasm/tree/main/web).

I’ll also omit most of webpack.config.js, which is also pretty standard stuff. All we need to add is a rule so that Webpack knows to include our `.wasm` files in the app bundle:

```javascript
module.exports = {
  entry: "./src/index.ts",
  // typical stuff...
  module: {
    rules: [
      {
        test: /\.wasm$/i,
        type: "asset/resource",
      },
      // Other typical rules for Webpack TypeScript apps
    ]
  }
};
```

With our C++ code compiled and placed for us under `web/src/cpp` by CMake, all that’s left to do to run our app is to go into the web directory and `npm && npm run serve`! Then we can open `localhost:8080` to see the application running. You should see the color change over time, like in the video below.

{{< numbered_video src="https://cdn.willusher.io/build-ship-debug-wasm/app_running.mp4" >}}

# Integration and Debugging with VSCode

With our example app built and running, we can now open it up in VSCode to debug it! To do this we’ll write a few custom VSCode tasks and a custom launch command so that we can just hit `F5` and the app will be rebuilt, run, and the browser opened to it. In my build process I assume that you’ve configured CMake outside of VSCode by running `emcmake cmake ..` in the `cmake-build` subdirectory, and so the build tasks will work off this assumption. You could also setup a `CMakeUserPresets.json` as [described by Andre Weissflog](https://floooh.github.io/2023/11/11/emscripten-ide.html) to configure from within VSCode.

You’ll also need to install the [WebAssembly DWARF Debugging plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode.wasm-dwarf-debugging) for VSCode to have VSCode load and use the embedded DWARF symbols in the WASM file.

Before we start, we can also get intellisense working in VSCode for Emscripten functions by adding the include path to our `.vscode/c_cpp_properties.json` file. For example on my mac, I have the following.

```json
{
  "configurations": [
    {
      "name": "Emscripten",
      "includePath": [
        "${workspaceFolder}/**",
        "/opt/homebrew/Cellar/emscripten/*/libexec/cache/sysroot/include/"
      ],
      "defines": ["EMSCRIPTEN"],
      "macFrameworkPath": [
        "/Library/Developer/CommandLineTools/SDKs/MacOSX14.sdk/System/Library/Frameworks"
      ],
      "cStandard": "c20",
      "cppStandard": "c++20",
      "intelliSenseMode": "${default}"
    }
  ],
  "version": 4
}
```

The Emscripten sysroot include path will differ if you’re on Linux or Windows or didn’t install Emscripten through homebrew, so set these appropriately for your machine and where you’ve installed Emscripten. Then you should get completions for Emscripten functions:

{{< numbered_fig src="https://cdn.willusher.io/build-ship-debug-wasm/emscripten_intellisense.png" >}}

## VSCode Tasks to Build and Run the App

There are a few tasks we want to run when we hit `F5` to run our app in the debugger:

- `build`: Run `cmake --build .` to rebuild the C++ code
- `npm_install`: Run `npm i` to install any new dependencies in the web app
- `npm_serve`: Run `npm run serve` in the background to start Webpack’s development webserver

And finally, we want a debug launch config to open the browser to `localhost:8080` to run the app.
We’ll also add a final task, `stop_server`, that will stop the `npm_serve` task. This will be used to shutdown the server after we’re done debugging.

The build task assumes you’ve configured the CMake build outside of VSCode using the `emcmake` wrapper in the `cmake-build` directory, and can be omitted if you’re using a `CMakeUserPresets.json`. The `npm_serve` task depends on both `build` and `npm_install` to ensure the app is up to date before we start running it.

The `.vscode/tasks.json` is below.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "cmake",
      "args": ["--build", "."],
      "options": {
        "cwd": "${workspaceFolder}/cmake-build"
      },
      "problemMatcher": ["$gcc"]
    },
    {
      "label": "npm_install",
      "type": "shell",
      "command": "npm i",
      "options": {
        "cwd": "${workspaceFolder}/web"
      }
    },
    {
      "label": "npm_serve",
      "type": "shell",
      "command": "npm run serve",
      "options": {
        "cwd": "${workspaceFolder}/web"
      },
      "dependsOn": ["npm_install", "build"],
      "isBackground": true
    },
    {
      "label": "stop_server",
      "type": "shell",
      "command": "echo ${input:stop_server_input}"
    }
  ],
  "inputs": [
    {
      "id": "stop_server_input",
      "type": "command",
      "command": "workbench.action.tasks.terminate",
      "args": "npm_serve"
    }
  ]
}
```

Next we need a launch config for VSCode to tell it how to start running our app for debugging. This task is similar to any frontend debug task you might have for VSCode, it just opens `localhost:8080` in Chrome. We set `npm_serve` as the pre-launch task to have VSCode build the app and start the Webpack dev server before opening Chrome, and `stop_server` as the post-debug task to have it stop the Webpack dev server when we stop debugging.

Our `.vscode/launch.json` is below.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8080",
      "preLaunchTask": "npm_serve",
      "postDebugTask": "stop_server"
    }
  ]
}
```

## Breakpoints

With all that setup, we’re ready to hit `F5` and run our app in the debugger! Make sure you have the [WebAssembly DWARF Debugging plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode.wasm-dwarf-debugging) for VSCode so it can read the app debug symbols, then you can hit `F5` or run the debug configuration. VSCode will run the build/run tasks and then open Chrome up on the app page. You can then click in the gutter to set a breakpoint, as shown in the clip below. When stopped on a breakpoint you can view the callstack and local and global variables, much as you would when debugging a native C++ app.

{{< numbered_video src="https://cdn.willusher.io/build-ship-debug-wasm/hit_breakpoint.mp4" >}}

Breakpoints in WASM are resolved lazily. This means that if you set a breakpoint in the main function before starting your debug session the breakpoint won’t be hit, because the DWARF symbols and break points have not been resolved yet. You can hit the restart button in VSCode (the green circle arrow) to restart and it will hit the breakpoint on the second run, as shown below.

{{< numbered_video src="https://cdn.willusher.io/build-ship-debug-wasm/lazy_breakpoints.mp4" >}}

## Inspecting Variables

As shown briefly in the first breakpoints clip, we can also inspect local and global variables when the program is stopped on a breakpoint. One limitation is that debug handlers to make reading STL containers don’t appear to exist yet so it’s a bit harder to read their contents. I've found that inspecting variables only works in full debug builds, though setting breakpoints does also work in RelWithDebInfo builds (if you disable separate DWARF).

In the clip below we set a breakpoint in the app loop and watch the values of `hue` and `rgb` change on each iteration.

{{< numbered_video src="https://cdn.willusher.io/build-ship-debug-wasm/inspect_vars.mp4" >}}

# Debugging Stack Traces from Production

The final issue we’ll look at is how to reconstruct source information when our WASM code crashes in production using [wasm-tools addr2line](https://github.com/bytecodealliance/wasm-tools)). We want to minimize our WASM binary size in production, so we’ve built with `-gseparate-dwarf` as discussed above when talking about the CMake setup, meaning that we have a smaller `app.wasm` file that we bundle in our deployed app, and a larger `app.dwarf` file containing all the debug symbols that we keep locally. To give a feel for the size reduction this achives, the example app’s `app.wasm` is about 7KB and `app.dwarf` is 87KB.

Even though we’ve split out the DWARF symbols, if a crash occurs Emscripten will print out WASM code address information as part of the stack trace. In your deployed app, you can intercept Emscripten’s `onAbort` and `printErr` handlers to log these stack traces back to your logging infrastructure to debug them.

For example, if we stick an abort inside our app loop and build in the `RelWithDebInfo` config:

```cpp
void app_loop(void *)
{
    // Update the hue to change the color this frame
    hue = (hue + 1) % 360;
    const auto rgb = hsv_to_rgb({static_cast<float>(hue), 0.8f, 0.8f});
    std::abort();

    glClearColor(rgb[0], rgb[1], rgb[2], 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
}
```

We’ll see the following displayed on the screen and in the console:

```text
Aborted(). Build with -sASSERTIONS for more info.
RuntimeError: Aborted(). Build with -sASSERTIONS for more info.
    at abort (http://localhost:8080/e3793d9897d38727a06c.js:3888:11)
    at __abort_js (http://localhost:8080/e3793d9897d38727a06c.js:4137:7)
    at app.wasm.abort (http://localhost:8080/e4e8e3209aa795a39fbf.wasm:wasm-function[9]:0x295)
    at app.wasm.app_loop(void*) (http://localhost:8080/e4e8e3209aa795a39fbf.wasm:wasm-function[7]:0x24f)
    at browserIterationFunc (http://localhost:8080/e3793d9897d38727a06c.js:5050:63)
    at callUserCallback (http://localhost:8080/e3793d9897d38727a06c.js:4260:9)
    at Object.runIter (http://localhost:8080/e3793d9897d38727a06c.js:4339:11)
    at Browser_mainLoop_runner (http://localhost:8080/e3793d9897d38727a06c.js:5006:26)
```

To figure out where we crashed in our source code we can take the memory addresses at the end of the `.wasm` entries in the stack trace and pass them and `app.dwarf` to wasm-tools addr2line. addr2line will tell us where the memory addresses map to in the source code:

```text
$ wasm-tools addr2line ./app.dwarf 0x295 0x24f
0x295: abort /opt/homebrew/Cellar/emscripten/3.1.61/libexec/cache/build/libc-tmp/../../../system/lib/libc/musl/src/exit/abort.c:21:2
0x24f: app_loop(void*) /Users/will/repos/build-ship-dbg-wasm/src/main.cpp:41:5
```

We see that `0x295` is the address of `abort`, and `0x24f` is the line inside `app_loop` where we called it! With this, even if our app crashes in production, we can see where the crash happened and start debugging the issue.

When using this approach you need to keep the DWARF file produced when you built your C++ code around. Just recompiling the same commit may not quite reproduce the DWARF symbols that match the WASM file in production, as your Emscripten version may have changed, or some dependencies changed, etc.

# C++ WebGPU → Native/Wasm Starter Template on Github

You can find the full code discussed in this post on Github: [github.com/Twinklebear/build-ship-dbg-wasm](https://github.com/Twinklebear/build-ship-dbg-wasm). If you’re interested in getting started with WebGPU and compiling the same code for WASM and native builds (or just targeting one of those environments), check out my template repo: [github.com/Twinklebear/webgpu-cpp-wasm](https://github.com/Twinklebear/webgpu-cpp-wasm). The WebGPU template uses the same build and debug config discussed here. In the browser the template uses Emscripten’s SDL2 build and the browser’s WebGPU implementation, in native builds it uses native SDL2 and Dawn for WebGPU.

As I mentioned at the start, I don’t know of that many apps using WASM in this way, or blogs/talks discussing techniques and performance considerations for such an app. So if you’re solving exciting problems working on an app with this structure I’d love to hear from you to learn about what you’re doing! You can get in touch with me by 
email (<a id="email-link"><span id="email-text"></span></a>),
[Twitter](https://twitter.com/_wusher), [Mastodon](https://mastodon.social/@willgfx), or [Linkedin](https://www.linkedin.com/in/will-usher/).
