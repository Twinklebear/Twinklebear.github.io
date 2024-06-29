---
title: 'Shipping C++ WebAssembly Packages on NPM'
date: 2024-06-22
layout: post
tags: [webassembly, C++]

---

In the [previous post]({{< ref "build-ship-debug-wasm.md" >}}) we saw how to build, ship and debug a C++ WebAssembly (WASM) application, where we had the compute and rendering parts of our app written in C++ and compiled to WASM, while the other frontend parts of the app were written in TypeScript and called into our C++ code. This app architecture is similar to Figma, (I think) Inigo Quilez’s [Project Neo at Adobe](https://projectneo.adobe.com/), and what I work on at [Luminary Cloud](https://www.luminarycloud.com/). By pushing the heavy rendering and compute work into WASM we gain serious performance improvements, while allowing us to still leverage all the great work on frontend frameworks, HTML, etc. for UI development, accessibility, etc.

Previously we just had CMake copy the compiled WASM into the web app’s source tree directly; however, that doesn't make our WASM re-usable or portable across projects. Now we’re going to look at how to publish our WASM as an NPM package and use it from a TypeScript app by installing it! Shipping our WASM code through an NPM package makes it easy for us and others to integrate it into a frontend application. I hope this post will provide some insights and inspire you to write and ship your own WASM NPM packages to accelerate compute and graphics on the web!
Let me know about the cool stuff you're building by
email (<a id="email-link"><span id="email-text"></span></a>),
[Twitter](https://twitter.com/_wusher), [Mastodon](https://mastodon.social/@willgfx), or [Linkedin](https://www.linkedin.com/in/will-usher/).

<!--more-->

# Example Application Structure

Our example app and package structure stays pretty similar, with the addition of the `npm_package` directory which is where we’ll define our NPM package. You can find the code on Github: [github.com/Twinklebear/ship-wasm-npm](https://github.com/Twinklebear/ship-wasm-npm) . One thing to notice is that we’ve moved the `wasm.d.ts` file from `web/src` to `npm_package/src` . Our NPM package will be the one compiling the TypeScript + WASM code, and so that’s where the typings file needs to be now.

```text
CMakeLists.txt
src/ -> C++ code
  CMakeLists.txt
  main.cpp
npm_package/ -> NPM package
  package.json
  tsconfig.json
  webpack.config.js
  src/ -> NPM package source code
    index.ts
    wasm.d.ts
web/ -> TypeScript frontend app
  index.html
  package.json
  tsconfig.json
  webpack.config.js
  src/ -> TypeScript app source code
    index.ts
```

## Build and Run Process

The build and run process for the app is a bit different. Now we’ll build our NPM package and use that from the web app by linking or installing it, instead of copying the WASM directly into the web app. The process is:

- Compile the C++ code with Emscripten and copy the compiled WASM into the NPM package
- Build the NPM package
- Pull the WASM package into the web app:
  - When developing locally: `npm link` to use our local build
  - When publishing: `npm install` to install from NPM
- Run the webpack dev server for our web app

# Writing an NPM Package to Wrap our WASM

The NPM package we’re adding ([github.com/Twinklebear/ship-wasm-npm/npm_package](https://github.com/Twinklebear/ship-wasm-npm/tree/main/npm_package)) simply wraps loading our WASM module and calling main. To make the code more portable, I’ve modified the C++ code to take the ID of the canvas element to render to as an argument to the main function. The package exports just one function, `runWasm`, that takes the canvas name and passes it to the WASM (`npm_package/src/index.ts`):

```typescript
import CppApp from "./cpp/app.js";

export async function runWasm(canvas: string) {
  const app = await CppApp();
  app.callMain([canvas]);
}
```

We’ve also moved the `wasm.d.ts` file over to `npm_package/src`

```typescript
declare module "*.wasm"
{
  const content: any;
  export default content;
}
```

The `webpack.config.js` is pretty typical for a UMD module, for brevity I’ll just show a few key entries here. We’re just targeting web environments in this case, but you can also build for node and web worker contexts with Emscripten. Note that we’ve also moved the `.wasm` [asset resource](https://webpack.js.org/guides/asset-modules/#resource-assets) module rule from the web app directory to the `npm_package`  since it’s now built as part of our package.

```javascript
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  target: "web",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    globalObject: "this",
    library: {
      name: "npm_package",
      type: "umd",
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/i,
        type: "asset/resource",
      },
  
    ],
  },
  /// etc...
};
```

In our `package.json` things are pretty standard for a Webpack + TypeScript project. I’ll just highlight the `files` and `scripts` entries, where for convenience we’ll have a `make clean` kind of command to clean the dist build output directory. We’ll use the `clean_dist` command before publishing the package to make sure we aren’t bundling any older builds of the C++ code in the `dist` directory.

```json
{
  "files": [
    "dist"
  ],
  "scripts": {
    "clean_dist": "rm -rf ./dist",
    "build": "webpack"
  }
}
```

# Publishing to NPM from CMake

We’ll add a few more custom CMake commands to `src/CMakeLists.txt` to let us build and publish the WASM NPM package directly from the C++ build directory. This will give us a convenient development process where `make` will build our C++ code and NPM package, and with just `make npm_publish` (or `cmake --build . -t npm_publish`) we can publish it to NPM.

First, we need to update our `copy_wasm` target to copy the Emscripten build outputs into the NPM package instead of the web app:

```cmake
set(NPM_PACKAGE_DIR ${PROJECT_SOURCE_DIR}/npm_package)
set(PACKAGE_OUT_DIR ${NPM_PACKAGE_DIR}/src/cpp)

add_custom_command(
  DEPENDS app
  OUTPUT ${PACKAGE_OUT_DIR}/app.js ${PACKAGE_OUT_DIR}/app.wasm
  COMMAND cmake -E make_directory ${PACKAGE_OUT_DIR}
  COMMAND cmake -E copy_if_different ${CMAKE_CURRENT_BINARY_DIR}/app.js
          ${CMAKE_CURRENT_BINARY_DIR}/app.wasm ${PACKAGE_OUT_DIR})

add_custom_target(
  copy_wasm_to_package ALL
  DEPENDS ${PACKAGE_OUT_DIR}/app.js ${PACKAGE_OUT_DIR}/app.wasm
  COMMENT "Copying wasm build to ${PACKAGE_OUT_DIR}")

```

Next we’ll add a command that depends on both our WASM output and the NPM package’s source code to build the NPM package when either has changed. We’ll add this to the `ALL` target so it’s run automatically when we `make` , so that `make` (or `cmake --build .` ) will build the C++ code, copy it to the NPM package, then build the NPM package.

```cmake
# Custom command to build our npm package. We want it to also depend on our
# npm_package source code, so we do a glob to pick that up
file(GLOB NPM_PACKAGE_SRC ${NPM_PACKAGE_DIR}/package.json
     ${NPM_PACKAGE_DIR}/tsconfig.json ${NPM_PACKAGE_DIR}/webpack.config.js
     ${NPM_PACKAGE_DIR}/src/*.ts)

add_custom_command(
  DEPENDS copy_wasm_to_package ${NPM_PACKAGE_SRC}
  OUTPUT ${PACKAGE_OUT_DIR}/dist/index.js
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}/npm_package
  COMMAND npm i
  COMMAND npm run build)

add_custom_target(
  build_npm_package ALL
  DEPENDS ${PACKAGE_OUT_DIR}/dist/index.js
  COMMENT "Building npm package")
```

Finally we can add another custom target to publish our NPM package with `make npm_publish` (or `cmake --build . -t npm_publish`). This will depend on just copying the WASM over and the package source files, since we want to run `clean_dist` before publishing the package to ensure we don’t upload any older WASM files as part of the package:

```cmake
add_custom_target(
  npm_publish
  DEPENDS copy_wasm_to_package ${NPM_PACKAGE_SRC}
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}/npm_package
  COMMAND npm i
  # First clean out the dist directory so we don't package
  # old wasm binaries
  COMMAND npm run clean_dist
  COMMAND npm run build
  COMMAND npm publish)
```

# Using our WASM Package in an App

Now in our web app we can delete the WASM related files, the `cpp` subdirectory, etc. and just install the WASM module from NPM! If you want to try it out I’ve published the code from this post as [@twinklebear/wasm_demo_package](https://www.npmjs.com/package/@twinklebear/wasm_demo_package),
so we can just install it with npm:

```text
npm i @twinklebear/wasm_demo_package
```

When developing locally you can link the local build of the package with npm link:

```text
cd web
npm link ../npm_package
```

Then our web app can just import `runWasm` from the package and call it, passing the canvas ID string to render to. It looks and imports just like any other TypeScript/JavaScript package, which is awesome!

```typescript
import { runWasm } from "@twinklebear/wasm_demo_package";

(async () => {
  await runWasm("#my-canvas");
})();
```

## Serving the WASM File with Copy Webpack Plugin

There is one last step though, if we just run our web app now we’ll see an error the the `.wasm` file couldn’t be found and if we look in the network tab the webpack dev server returned 404 for our `.wasm` file. The error we see on the page will be:

```text
Aborted(both async and sync fetching of the wasm failed)
RuntimeError: Aborted(both async and sync fetching of the wasm failed)
    at abort (http://localhost:8080/5be0ef95e8fa37fbae7f.js:578:11)
    at http://localhost:8080/5be0ef95e8fa37fbae7f.js:671:5
```

This is because our `.wasm` file is packaged as a separate resource in the NPM package, and webpack doesn’t know that it should be serving it as part of the app. We can fix this by using the [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/) to copy the WASM file from our NPM package to be served by webpack and bundled with our web app when we build it. We’ll need to install the `copy-webpack-plugin` as a development dependency

```text
npm i copy-webpack-plugin --save-dev
```

add the following to `web/webpack.config.js` to tell it to copy the WASM file as part of the app.

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  // ... above same as before
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          // Find our WASM file and serve it at /[name].wasm on the page
          from: "./node_modules/@twinklebear/wasm_demo_package/dist/*.wasm",
          to() {
            return "[name][ext]";
          },
        },
      ],
    }),
  ],
};

```

With that we should see the same page as last time:

{{< numbered_video src="https://cdn.willusher.io/build-ship-debug-wasm/app_running.mp4" >}}

It’s worth mentioning that you can avoid this need for end apps to use the copy-webpack-plugin if you package your WASM as an [`asset/inline`](https://webpack.js.org/guides/asset-modules/#inlining-assets) type instead of `asset/resource`. However, this would only work well for extremely small WASM files, as it converts the binary to base64 to inline it into your compiled module code as a string. This will increase the module size vs. packaging it as binary and lead to poorer compilation times when instantiating the WASM code in the browser.

I’d be interested to hear if there was a better way to have end apps ship the WASM at the right path without requiring them to manually copy the file from the NPM package, as it would make things a lot easier for end apps. Let me know if you’re aware of something better!

# VSCode Integration

If you’re using the VSCode debugging setup discussed in the last post we can also make it work with this build setup, we just need add another task between `npm_serve` and the `npm_install` and `build` tasks that will run `npm link` to link in our local development build of the package. This is the new `npm_link` task below, this task depends on `npm_install` and `build` which are the same as before. We don’t need to add `npm install` or `build` tasks for the NPM package since those are handled as part of the CMake build process that runs in the `build` task. Finally, our `npm_serve` just depends on the `npm_link` task, and our debug launch config is the same as before, requiring `npm_serve` as a pre-launch task to kick of the build and start the server.

The `.vscode/tasks.json` is below, the `.vscode/launch.json` is the same as before (see [Github](https://github.com/Twinklebear/ship-wasm-npm/blob/main/.vscode/launch.json)).
With these additional tasks we can still run the debugging config in VSCode and set breakpoints,
inspect local variables, etc. as before.

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
      "isBuildCommand": true,
      "options": {
        "cwd": "${workspaceFolder}/web"
      }
    },
    {
      "label": "npm_link",
      "type": "shell",
      "command": "npm link ../npm_package",
      "dependsOn": ["npm_install", "build"],
      "isBuildCommand": true,
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
      "dependsOn": ["npm_link"],
      "isBackground": true
    },
    {
      "label": "stop_webpack",
      "type": "shell",
      "command": "echo ${input:stop_webpack_input}",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "stop_webpack_input",
      "type": "command",
      "command": "workbench.action.tasks.terminate",
      "args": "run_app"
    }
  ]
}
```
