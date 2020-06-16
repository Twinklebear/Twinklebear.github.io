(async () => {
    if (!navigator.gpu) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
        return;
    }

    // Get a GPU device to render with
    var adapter = await navigator.gpu.requestAdapter();
    var device = await adapter.requestDevice();

    // Get a context to display our rendered image on the canvas
    var canvas = document.getElementById("webgpu-canvas");
    var context = canvas.getContext("gpupresent");

    // Embedded SPV bytecode for our shaders
    const triangle_vert_spv = new Uint32Array([
        0x07230203,0x00010000,0x000d0008,0x00000018,
        0x00000000,0x00020011,0x00000001,0x0006000b,
        0x00000001,0x4c534c47,0x6474732e,0x3035342e,
        0x00000000,0x0003000e,0x00000000,0x00000001,
        0x0009000f,0x00000000,0x00000004,0x6e69616d,
        0x00000000,0x00000009,0x0000000b,0x00000012,
        0x00000015,0x00030003,0x00000002,0x000001c2,
        0x000a0004,0x475f4c47,0x4c474f4f,0x70635f45,
        0x74735f70,0x5f656c79,0x656e696c,0x7269645f,
        0x69746365,0x00006576,0x00080004,0x475f4c47,
        0x4c474f4f,0x6e695f45,0x64756c63,0x69645f65,
        0x74636572,0x00657669,0x00040005,0x00000004,
        0x6e69616d,0x00000000,0x00040005,0x00000009,
        0x6c6f6366,0x0000726f,0x00040005,0x0000000b,
        0x6c6f6376,0x0000726f,0x00060005,0x00000010,
        0x505f6c67,0x65567265,0x78657472,0x00000000,
        0x00060006,0x00000010,0x00000000,0x505f6c67,
        0x7469736f,0x006e6f69,0x00070006,0x00000010,
        0x00000001,0x505f6c67,0x746e696f,0x657a6953,
        0x00000000,0x00070006,0x00000010,0x00000002,
        0x435f6c67,0x4470696c,0x61747369,0x0065636e,
        0x00070006,0x00000010,0x00000003,0x435f6c67,
        0x446c6c75,0x61747369,0x0065636e,0x00030005,
        0x00000012,0x00000000,0x00030005,0x00000015,
        0x00736f70,0x00040047,0x00000009,0x0000001e,
        0x00000000,0x00040047,0x0000000b,0x0000001e,
        0x00000001,0x00050048,0x00000010,0x00000000,
        0x0000000b,0x00000000,0x00050048,0x00000010,
        0x00000001,0x0000000b,0x00000001,0x00050048,
        0x00000010,0x00000002,0x0000000b,0x00000003,
        0x00050048,0x00000010,0x00000003,0x0000000b,
        0x00000004,0x00030047,0x00000010,0x00000002,
        0x00040047,0x00000015,0x0000001e,0x00000000,
        0x00020013,0x00000002,0x00030021,0x00000003,
        0x00000002,0x00030016,0x00000006,0x00000020,
        0x00040017,0x00000007,0x00000006,0x00000004,
        0x00040020,0x00000008,0x00000003,0x00000007,
        0x0004003b,0x00000008,0x00000009,0x00000003,
        0x00040020,0x0000000a,0x00000001,0x00000007,
        0x0004003b,0x0000000a,0x0000000b,0x00000001,
        0x00040015,0x0000000d,0x00000020,0x00000000,
        0x0004002b,0x0000000d,0x0000000e,0x00000001,
        0x0004001c,0x0000000f,0x00000006,0x0000000e,
        0x0006001e,0x00000010,0x00000007,0x00000006,
        0x0000000f,0x0000000f,0x00040020,0x00000011,
        0x00000003,0x00000010,0x0004003b,0x00000011,
        0x00000012,0x00000003,0x00040015,0x00000013,
        0x00000020,0x00000001,0x0004002b,0x00000013,
        0x00000014,0x00000000,0x0004003b,0x0000000a,
        0x00000015,0x00000001,0x00050036,0x00000002,
        0x00000004,0x00000000,0x00000003,0x000200f8,
        0x00000005,0x0004003d,0x00000007,0x0000000c,
        0x0000000b,0x0003003e,0x00000009,0x0000000c,
        0x0004003d,0x00000007,0x00000016,0x00000015,
        0x00050041,0x00000008,0x00000017,0x00000012,
        0x00000014,0x0003003e,0x00000017,0x00000016,
        0x000100fd,0x00010038]);
    const triangle_frag_spv = new Uint32Array([
        0x07230203,0x00010000,0x000d0008,0x0000000d,
        0x00000000,0x00020011,0x00000001,0x0006000b,
        0x00000001,0x4c534c47,0x6474732e,0x3035342e,
        0x00000000,0x0003000e,0x00000000,0x00000001,
        0x0007000f,0x00000004,0x00000004,0x6e69616d,
        0x00000000,0x00000009,0x0000000b,0x00030010,
        0x00000004,0x00000007,0x00030003,0x00000002,
        0x000001c2,0x000a0004,0x475f4c47,0x4c474f4f,
        0x70635f45,0x74735f70,0x5f656c79,0x656e696c,
        0x7269645f,0x69746365,0x00006576,0x00080004,
        0x475f4c47,0x4c474f4f,0x6e695f45,0x64756c63,
        0x69645f65,0x74636572,0x00657669,0x00040005,
        0x00000004,0x6e69616d,0x00000000,0x00040005,
        0x00000009,0x6f6c6f63,0x00000072,0x00040005,
        0x0000000b,0x6c6f6366,0x0000726f,0x00040047,
        0x00000009,0x0000001e,0x00000000,0x00040047,
        0x0000000b,0x0000001e,0x00000000,0x00020013,
        0x00000002,0x00030021,0x00000003,0x00000002,
        0x00030016,0x00000006,0x00000020,0x00040017,
        0x00000007,0x00000006,0x00000004,0x00040020,
        0x00000008,0x00000003,0x00000007,0x0004003b,
        0x00000008,0x00000009,0x00000003,0x00040020,
        0x0000000a,0x00000001,0x00000007,0x0004003b,
        0x0000000a,0x0000000b,0x00000001,0x00050036,
        0x00000002,0x00000004,0x00000000,0x00000003,
        0x000200f8,0x00000005,0x0004003d,0x00000007,
        0x0000000c,0x0000000b,0x0003003e,0x00000009,
        0x0000000c,0x000100fd,0x00010038]);

    // Setup shader modules
    var vertModule = device.createShaderModule({code: triangle_vert_spv});
    var vertexStage =  {
        module: vertModule,
        entryPoint: "main"
    };

    var fragModule = device.createShaderModule({code: triangle_frag_spv});
    var fragmentStage =  {
        module: fragModule,
        entryPoint: "main"
    };

    // Specify vertex data
    var [dataBuf, dataBufMapping] = device.createBufferMapped({
        size: 3 * 2 * 4 * 4,
        usage: GPUBufferUsage.VERTEX
    });
    // Interleaved positions and colors
    new Float32Array(dataBufMapping).set([
        1, -1, 0, 1,
        1, 0, 0, 1,
        -1, -1, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
    ]);
    dataBuf.unmap();

    var vertexState = {
        vertexBuffers: [
            {
                arrayStride: 2 * 4 * 4,
                attributes: [
                    {
                        format: "float4",
                        offset: 0,
                        shaderLocation: 0
                    },
                    {
                        format: "float4",
                        offset: 4 * 4,
                        shaderLocation: 1
                    }
                ]
            }
        ]
    };

    // Setup render outputs
    var swapChainFormat = "bgra8unorm";
    var swapChain = context.configureSwapChain({
        device: device,
        format: swapChainFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });

    var depthFormat = "depth24plus-stencil8";
    var depthTexture = device.createTexture({
        size: {
            width: canvas.width,
            height: canvas.height,
            depth: 1
        },
        format: depthFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });

    // Create render pipeline
    var layout = device.createPipelineLayout({bindGroupLayouts: []});

    var renderPipeline = device.createRenderPipeline({
        layout: layout,
        vertexStage: vertexStage,
        fragmentStage: fragmentStage,
        primitiveTopology: "triangle-list",
        vertexState: vertexState,
        colorStates: [{
            format: swapChainFormat
        }],
        depthStencilState: {
            format: depthFormat,
            depthWriteEnabled: true,
            depthCompare: "less"
        }
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

    // Not covered in the tutorial: track when the canvas is visible
    // on screen, and only render when it is visible.
    var canvasVisible = false;
    var observer = new IntersectionObserver(function(e) {
        if (e[0].isIntersecting) {
            canvasVisible = true;
        } else {
            canvasVisible = false;
        }
    }, {threshold: [0]});
    observer.observe(canvas);

    var frame = function() {
        if (canvasVisible) {
            renderPassDesc.colorAttachments[0].attachment = swapChain.getCurrentTexture().createView();

            var commandEncoder = device.createCommandEncoder();

            var renderPass = commandEncoder.beginRenderPass(renderPassDesc);

            renderPass.setPipeline(renderPipeline);
            renderPass.setVertexBuffer(0, dataBuf);
            renderPass.draw(3, 1, 0, 0);

            renderPass.endPass();
            device.defaultQueue.submit([commandEncoder.finish()]);
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();

