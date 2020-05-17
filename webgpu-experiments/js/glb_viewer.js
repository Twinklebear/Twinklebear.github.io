(async () => {
    if (!navigator.gpu) {
        alert("WebGPU is not supported/enabled in your browser");
        return;
    }

    var adapter = await navigator.gpu.requestAdapter();
    var device = await adapter.requestDevice();

    //var glbFile = await fetch("/models/2CylinderEngine.glb")
    //var glbFile = await fetch("/models/suzanne_texture.glb")
    //var glbFile = await fetch("/models/FlightHelmet.glb")
    var glbFile = await fetch("/models/sponza.glb")
    //var glbFile = await fetch("/models/san-miguel.glb")
    //var glbFile = await fetch("/models/DamagedHelmet.glb")
        .then(res => res.arrayBuffer());

    // The file header and chunk 0 header
    // TODO: It sounds like the spec does allow for multiple binary chunks,
    // so then how do you know which chunk a buffer exists in? Maybe the buffer id
    // corresponds to the binary chunk ID? Would have to find info in the spec
    // or an example file to check this
    var header = new Uint32Array(glbFile, 0, 5);
    if (header[0] != 0x46546C67) {
        alert("This does not appear to be a glb file?");
        return;
    }
    console.log(`GLB Version ${header[1]}, file length ${header[2]}`);
    console.log(`JSON chunk length ${header[3]}, type ${header[4]}`);
    var glbJsonData = JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(glbFile, 20, header[3])));
    console.log(glbJsonData);

    var binaryHeader = new Uint32Array(glbFile, 20 + header[3], 2);
    var glbBuffer = new GLTFBuffer(glbFile, binaryHeader[0], 28 + header[3]);

    if (28 + header[3] + binaryHeader[0] != glbFile.byteLength) {
        console.log("TODO: Multiple binary chunks in file");
    }

    // TODO: Later could look at merging buffers and actually using the starting offsets,
    // but want to avoid uploading the entire buffer since it may contain packed images 
    var bufferViews = []
    for (var i = 0; i < glbJsonData.bufferViews.length; ++i) {
        bufferViews.push(new GLTFBufferView(glbBuffer, glbJsonData.bufferViews[i]));
    }

    var images = [];
    if (glbJsonData["images"] !== undefined) {
        for (var i = 0; i < glbJsonData["images"].length; ++i) {
            var imgJson = glbJsonData["images"][i];
            var imageView = new GLTFBufferView(glbBuffer, glbJsonData["bufferViews"][imgJson["bufferView"]]);
            var imgBlob = new Blob([imageView.buffer], {type: imgJson["mime/type"]});
            var img = await createImageBitmap(imgBlob);

            // TODO: For glTF we need to look at where an image is used to know if
            // it should be srgb or not. We basically need to pass through the material list
            // and find if the texture which uses this image is used by a metallic/roughness param
            var gpuImg = device.createTexture({
                size: [img.width, img.height, 1],
                format: "rgba8unorm-srgb",
                usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
            });

            var copySrc = {
                imageBitmap: img
            };
            var copyDst = {
                texture: gpuImg
            };
            device.defaultQueue.copyImageBitmapToTexture(copySrc, copyDst, [img.width, img.height, 1]);

            images.push(gpuImg);
        }
    }

    var defaultSampler = new GLTFSampler({}, device);
    var samplers = [];
    if (glbJsonData["samplers"] !== undefined) {
        for (var i = 0; i < glbJsonData["samplers"].length; ++i) {
            samplers.push(new GLTFSampler(glbJsonData["samplers"][i], device));
        }
    }

    var textures = [];
    if (glbJsonData["textures"] !== undefined) {
        for (var i = 0; i < glbJsonData["textures"].length; ++i) {
            var tex = glbJsonData["textures"][i];
            var sampler = tex["sampler"] !== undefined ? samplers[tex["sampler"]] : defaultSampler;
            textures.push(new GLTFTexture(sampler, images[tex["source"]]));
        }
    }

    var defaultMaterial = new GLTFMaterial({});
    var materials = [];
    for (var i = 0; i < glbJsonData["materials"].length; ++i) {
        materials.push(new GLTFMaterial(glbJsonData["materials"][i], textures));
    }
    console.log(materials);

    var meshes = [];
    for (var i = 0; i < glbJsonData.meshes.length; ++i) {
        var mesh = glbJsonData.meshes[i];

        var primitives = []
        for (var j = 0; j < mesh.primitives.length; ++j) {
            var prim = mesh.primitives[j];
            if (prim["mode"] != undefined && prim["mode"] != 4) {
                alert("Ignoring primitive with unsupported mode " + prim["mode"]);
                continue;
            }

            var indices = null;
            if (glbJsonData["accessors"][prim["indices"]] !== undefined) {
                var accessor = glbJsonData["accessors"][prim["indices"]];
                var viewID = accessor["bufferView"];
                bufferViews[viewID].needsUpload = true;
                bufferViews[viewID].addUsage(GPUBufferUsage.INDEX);
                indices = new GLTFAccessor(bufferViews[viewID], accessor);
            }

            var positions = null;
            var normals = null;
            var texcoords = [];
            for (var attr in prim["attributes"]){
                var accessor = glbJsonData["accessors"][prim["attributes"][attr]];
                var viewID = accessor["bufferView"];
                bufferViews[viewID].needsUpload = true;
                bufferViews[viewID].addUsage(GPUBufferUsage.VERTEX);
                if (attr == "POSITION") {
                    positions = new GLTFAccessor(bufferViews[viewID], accessor);
                } else if (attr == "NORMAL") {
                    normals = new GLTFAccessor(bufferViews[viewID], accessor);
                } else if (attr.startsWith("TEXCOORD")) {
                    texcoords.push(new GLTFAccessor(bufferViews[viewID], accessor));
                }
            }

            var material = null;
            if (prim["material"] !== undefined) {
                material = materials[prim["material"]];
            } else {
                material = defaultMaterial;
            }

            var gltfPrim = new GLTFPrimitive(indices, positions, normals, texcoords, material);
            primitives.push(gltfPrim);
        }
        meshes.push(new GLTFMesh(mesh["name"], primitives));
    }
    console.log(meshes);

    // Upload the different views used by meshes
    for (var i = 0; i < bufferViews.length; ++i) {
        if (bufferViews[i].needsUpload) {
            bufferViews[i].upload(device);
        }
    }

    defaultMaterial.upload(device);
    for (var i = 0; i < materials.length; ++i) {
        materials[i].upload(device);
    }

    var nodes = []
    var gltfNodes = makeGLTFSingleLevel(glbJsonData["nodes"]);
    for (var i = 0; i < gltfNodes.length; ++i) {
        var n = gltfNodes[i];
        if (n["mesh"] !== undefined) {
            var node = new GLTFNode(n["name"], meshes[n["mesh"]], readNodeTransform(n));
            node.upload(device);
            nodes.push(node);
        }
    }
    console.log(nodes);

    var canvas = document.getElementById("webgpu-canvas");
    var context = canvas.getContext("gpupresent");
    var swapChainFormat = "bgra8unorm";
    var swapChain = context.configureSwapChain({
        device: device,
        format: swapChainFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });

    var depthTexture = device.createTexture({
        size: {
            width: canvas.width,
            height: canvas.height,
            depth: 1
        },
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });

    var renderPassDesc = {
        colorAttachments: [{
            attachment: undefined,
            loadValue: [0.3, 0.3, 0.3, 1]
        }],
        depthStencilAttachment: {
            attachment: depthTexture.createView(),
            depthLoadValue: 1.0,
            depthStoreOp: "store",
            stencilLoadValue: 0,
            stencilStoreOp: "store"
        }
    };

    var shaderModules = {
        posVert: {
            module: device.createShaderModule({code: glb_pos_vert_spv}),
            entryPoint: "main",
        },
        posFrag: {
            module: device.createShaderModule({code: glb_pos_frag_spv}),
            entryPoint: "main",
        },
        posNormalVert: {
            module: device.createShaderModule({code: glb_posnormal_vert_spv}),
            entryPoint: "main",
        },
        posNormalFrag: {
            module: device.createShaderModule({code: glb_posnormal_frag_spv}),
            entryPoint: "main",
        },
        posNormalUVVert: {
            module: device.createShaderModule({code: glb_posnormaluv_vert_spv}),
            entryPoint: "main",
        },
        posNormalUVFrag: {
            module: device.createShaderModule({code: glb_posnormaluv_frag_spv}),
            entryPoint: "main",
        },
        posUVVert: {
            module: device.createShaderModule({code: glb_posuv_vert_spv}),
            entryPoint: "main",
        },
        posUVFrag: {
            module: device.createShaderModule({code: glb_posuv_frag_spv}),
            entryPoint: "main",
        },
        pnuTexturedVert: {
            module: device.createShaderModule({code: glb_pnutex_vert_spv}),
            entryPoint: "main",
        },
        pnuTexturedFrag: {
            module: device.createShaderModule({code: glb_pnutex_frag_spv}),
            entryPoint: "main",
        },
    };

    var sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear"
    });

    var viewParamsLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                type: "uniform-buffer"
            }
        ]
    });

    var viewParamBuf = device.createBuffer({
        size: 4 * 4 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    var viewParamsBindGroup = device.createBindGroup({
        layout: viewParamsLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: viewParamBuf
                }
            }
        ]
    });

    var renderBundles = [];
    for (var i = 0; i < nodes.length; ++i) {
        var n = nodes[i];
        var bundle = n.buildRenderBundle(device, shaderModules, viewParamsLayout, viewParamsBindGroup,
            swapChainFormat, "depth24plus-stencil8");
        renderBundles.push(bundle);
    }

    const defaultEye = vec3.set(vec3.create(), 0.0, 0.0, 1.0);
    const center = vec3.set(vec3.create(), 0.0, 0.0, 0.0);
    const up = vec3.set(vec3.create(), 0.0, 1.0, 0.0);
    var camera = new ArcballCamera(defaultEye, center, up, 2, [canvas.width, canvas.height]);
	var proj = mat4.perspective(mat4.create(), 50 * Math.PI / 180.0,
		canvas.width / canvas.height, 0.1, 1000);
	var projView = mat4.create();

	var controller = new Controller();
	controller.mousemove = function(prev, cur, evt) {
		if (evt.buttons == 1) {
			camera.rotate(prev, cur);

		} else if (evt.buttons == 2) {
			camera.pan([cur[0] - prev[0], prev[1] - cur[1]]);
		}
	};
	controller.wheel = function(amt) { camera.zoom(amt * 0.5); };
	controller.pinch = controller.wheel;
	controller.twoFingerDrag = function(drag) { camera.pan(drag); };
	controller.registerForCanvas(canvas);

    var frame = function() {
        renderPassDesc.colorAttachments[0].attachment = swapChain.getCurrentTexture().createView();

        var commandEncoder = device.createCommandEncoder();
        
        projView = mat4.mul(projView, proj, camera.camera);
        var [upload, uploadMap] = device.createBufferMapped({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        });
        new Float32Array(uploadMap).set(projView);
        upload.unmap();

        commandEncoder.copyBufferToBuffer(upload, 0, viewParamBuf, 0, 4 * 4 * 4);

        var renderPass = commandEncoder.beginRenderPass(renderPassDesc);
        renderPass.executeBundles(renderBundles);

        renderPass.endPass();
        device.defaultQueue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();

