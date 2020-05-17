const GLTFRenderMode = {
    POINTS: 0,
    LINE: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    // Note: fans are not supported in WebGPU, use should be
    // an error or converted into a list/strip
    TRIANGLE_FAN: 6,
};

const GLTFComponentType = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    INT: 5124,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
    DOUBLE: 5130,
};

const GLTFTextureFilter = {
    NEAREST: 9728,
    LINEAR: 9729,
    NEAREST_MIPMAP_NEAREST: 9984,
    LINEAR_MIPMAP_NEAREST: 9985,
    NEAREST_MIPMAP_LINEAR: 9986,
    LINEAR_MIPMAP_LINEAR: 9987,
};

const GLTFTextureWrap = {
    REPEAT: 10497,
    CLAMP_TO_EDGE: 33071,
    MIRRORED_REPEAT: 33648,
};

var gltfTypeNumComponents = function(type) {
    switch (type) {
        case "SCALAR": return 1;
        case "VEC2": return 2;
        case "VEC3": return 3;
        case "VEC4": return 4;
        default:
            alert("Unhandled glTF Type " + type);
            return null;
    }
}

var gltfTypeToWebGPU = function(componentType, type) {
    var typeStr = null;
    switch (componentType) {
        case GLTFComponentType.BYTE:
            typeStr = "char";
            break;
        case GLTFComponentType.UNSIGNED_BYTE:
            typeStr = "uchar";
            break;
        case GLTFComponentType.SHORT:
            typeStr = "short";
            break;
        case GLTFComponentType.UNSIGNED_SHORT:
            typeStr = "ushort";
            break;
        case GLTFComponentType.INT:
            typeStr = "int";
            break;
        case GLTFComponentType.UNSIGNED_INT:
            typeStr = "uint";
            break;
        case GLTFComponentType.FLOAT:
            typeStr = "float";
            break;
        case GLTFComponentType.DOUBLE:
            typeStr = "double";
            break;
        default:
            alert("Unrecognized GLTF Component Type?");
    }

    switch (gltfTypeNumComponents(type)) {
        case 1: return typeStr;
        case 2: return typeStr + "2";
        case 3: return typeStr + "3";
        case 4: return typeStr + "4";
        default: alert("Too many components!");
    }
}

var gltfTypeSize = function(componentType, type) {
    var typeSize = 0;
    switch (componentType) {
        case GLTFComponentType.BYTE:
            typeSize = 1;
            break;
        case GLTFComponentType.UNSIGNED_BYTE:
            typeSize = 1;
            break;
        case GLTFComponentType.SHORT:
            typeSize = 2;
            break;
        case GLTFComponentType.UNSIGNED_SHORT:
            typeSize = 2;
            break;
        case GLTFComponentType.INT:
            typeSize = 4;
            break;
        case GLTFComponentType.UNSIGNED_INT:
            typeSize = 4;
            break;
        case GLTFComponentType.FLOAT:
            typeSize = 4;
            break;
        case GLTFComponentType.DOUBLE:
            typeSize = 4;
            break;
        default:
            alert("Unrecognized GLTF Component Type?");
    }
    return gltfTypeNumComponents(type) * typeSize;
}

// Create a GLTFBuffer referencing some ArrayBuffer
var GLTFBuffer = function(buffer, size, offset) {
    this.arrayBuffer = buffer;
    this.size = size;
    this.byteOffset = offset;
}

var GLTFBufferView = function(buffer, view) {
    this.length = view["byteLength"];
    this.byteOffset = buffer.byteOffset;
    if (view["byteOffset"] !== undefined) {
        this.byteOffset += view["byteOffset"];
    }
    this.byteStride = 0;
    if (view["byteStride"] !== undefined) {
        this.byteStride = view["byteStride"];
    }
    this.buffer = new Uint8Array(buffer.arrayBuffer, this.byteOffset, this.length);

    this.needsUpload = false;
    this.gpuBuffer = null;
    this.usage = 0;
}

GLTFBufferView.prototype.arrayBuffer = function() {
    return this.buffer.buffer;
}

GLTFBufferView.prototype.addUsage = function(usage) {
    this.usage = this.usage | usage;
}

GLTFBufferView.prototype.upload = function(device) {
    var [buf, mapping] = device.createBufferMapped({
        size: this.buffer.byteLength,
        usage: this.usage,
    });
    new (this.buffer.constructor)(mapping).set(this.buffer);
    buf.unmap();
    this.gpuBuffer = buf;
}

var GLTFAccessor = function(view, accessor) {
    this.count = accessor["count"];
    this.componentType = accessor["componentType"];
    this.gltfType = accessor["type"];
    this.webGPUType = gltfTypeToWebGPU(this.componentType, accessor["type"]);
    this.numComponents = gltfTypeNumComponents(accessor["type"]);
    this.numScalars = this.count * this.numComponents;
    this.view = view;
    this.byteOffset = 0;
    if (accessor["byteOffset"] !== undefined) {
        this.byteOffset = accessor["byteOffset"];
    }
}

GLTFAccessor.prototype.byteStride = function() {
    var elementSize = gltfTypeSize(this.componentType, this.gltfType);
    return Math.max(elementSize, this.view.byteStride);
}

var GLTFPrimitive = function(indices, positions, normals, texcoords, material) {
    this.indices = indices;
    this.positions = positions;
    this.normals = normals;
    this.texcoords = texcoords;
    this.material = material;
}

// Build the primitive render commands into the bundle
GLTFPrimitive.prototype.buildRenderBundle = function(device, bindGroupLayouts, bundleEncoder, shaderModules,
    swapChainFormat, depthFormat)
{
    var vertexStage = shaderModules.posVert;
    var fragmentStage = shaderModules.posFrag;

    var vertexBuffers = [
        {
            arrayStride: this.positions.byteStride(),
            attributes: [
                {
                    format: "float3",
                    offset: 0,
                    shaderLocation: 0
                }
            ]
        }
    ];
    if (this.normals) {
        vertexStage = shaderModules.posNormalVert;
        fragmentStage = shaderModules.posNormalFrag;

        vertexBuffers.push({
            arrayStride: this.normals.byteStride(),
            attributes: [
                {
                    format: "float3",
                    offset: 0,
                    shaderLocation: 1
                }
            ]
        });
    }
    // TODO: Multi-texturing
    if (this.texcoords.length > 0) {
        if (this.normals) {
            vertexStage = shaderModules.posNormalUVVert;
            fragmentStage = shaderModules.posNormalUVFrag;
        } else {
            vertexStage = shaderModules.posUVVert;
            fragmentStage = shaderModules.posUVFrag;
        }

        vertexBuffers.push({
            arrayStride: this.texcoords[0].byteStride(),
            attributes: [
                {
                    format: "float2",
                    offset: 0,
                    shaderLocation: 2
                }
            ]
        });
    }
    if (this.material.baseColorTexture) {
        vertexStage = shaderModules.pnuTexturedVert;
        fragmentStage = shaderModules.pnuTexturedFrag;
    }

    var layout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayouts[0], bindGroupLayouts[1], this.material.bindGroupLayout],
    });

    var pipelineDescriptor = {
        layout: layout,
        vertexStage: vertexStage,
        fragmentStage: fragmentStage,
        primitiveTopology: "triangle-list",
        vertexState: {
            vertexBuffers: vertexBuffers,
        },
        colorStates: [{
            format: swapChainFormat
        }],
        depthStencilState: {
            format: depthFormat,
            depthWriteEnabled: true,
            depthCompare: "less"
        }
    };
    if (this.indices) {
        pipelineDescriptor.vertexState.indexFormat =
            this.indices.componentType == GLTFComponentType.UNSIGNED_SHORT ? "uint16" : "uint32";
    }

    var renderPipeline = device.createRenderPipeline(pipelineDescriptor);

    bundleEncoder.setBindGroup(2, this.material.bindGroup);
    bundleEncoder.setPipeline(renderPipeline);
    bundleEncoder.setVertexBuffer(0, this.positions.view.gpuBuffer, this.positions.byteOffset, 0);
    bundleEncoder.setVertexBuffer(1, this.normals.view.gpuBuffer, this.normals.byteOffset, 0);
    if (this.texcoords.length > 0) {
        bundleEncoder.setVertexBuffer(2, this.texcoords[0].view.gpuBuffer, this.texcoords[0].byteOffset, 0);
    }
    if (this.indices) {
        bundleEncoder.setIndexBuffer(this.indices.view.gpuBuffer, this.indices.byteOffset, 0);
        bundleEncoder.drawIndexed(this.indices.count, 1, 0, 0, 0);
    } else {
        bundleEncoder.draw(this.positions.count, 1, 0, 0);
    }
}

var GLTFMesh = function(name, primitives) {
    this.name = name;
    this.primitives = primitives;
}

var GLTFNode = function(name, mesh, transform) {
    this.name = name;
    this.mesh = mesh;
    this.transform = transform;

    this.gpuUniforms = null;
    this.bindGroup = null;
}

GLTFNode.prototype.upload = function(device) {
    var [buf, mapping] = device.createBufferMapped({
        size: 4 * 4 * 4,
        usage: GPUBufferUsage.UNIFORM
    });
    new Float32Array(mapping).set(this.transform);
    buf.unmap();
    this.gpuUniforms = buf;
}

GLTFNode.prototype.buildRenderBundle = function(device, shaderModules, viewParamsLayout, viewParamsBindGroup,
    swapChainFormat, depthFormat)
{
    var nodeParamsLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                type: "uniform-buffer"
            }
        ]
    });

    this.bindGroup = device.createBindGroup({
        layout: nodeParamsLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: this.gpuUniforms
                }
            }
        ]
    });

    var bindGroupLayouts = [viewParamsLayout, nodeParamsLayout];

    var bundleEncoder = device.createRenderBundleEncoder({
        colorFormats: [swapChainFormat],
        depthStencilFormat: depthFormat,
    });

    bundleEncoder.setBindGroup(0, viewParamsBindGroup);
    bundleEncoder.setBindGroup(1, this.bindGroup);

    for (var i = 0; i < this.mesh.primitives.length; ++i) {
        this.mesh.primitives[i].buildRenderBundle(device, bindGroupLayouts, bundleEncoder, shaderModules,
            swapChainFormat, depthFormat);
    }

    this.renderBundle = bundleEncoder.finish();
    return this.renderBundle;
}

var readNodeTransform = function(node) {
    if (node["matrix"]) {
        var m = node["matrix"];
        // Both glTF and gl matrix are column major
        return mat4.fromValues(
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]
        );
    } else {
        var scale = [1, 1, 1];
        var rotation = [0, 0, 0, 1];
        var translation = [0, 0, 0];
        if (node["scale"]) {
            scale = node["scale"];
        }
        if (node["rotation"]) {
            rotation = node["rotation"];
        }
        if (node["translation"]) {
            translation = node["translation"];
        }
        var m = mat4.create();
        return mat4.fromRotationTranslationScale(m, rotation, translation, scale);
    }
}

var flattenGLTFChildren = function(nodes, node, parent_transform) {
    var tfm = readNodeTransform(node);
    var tfm = mat4.mul(tfm, parent_transform, tfm);
    node["matrix"] = tfm;
    node["scale"] = undefined;
    node["rotation"] = undefined;
    node["translation"] = undefined;
    if (node["children"]) {
        for (var i = 0; i < node["children"].length; ++i) {
            flattenGLTFChildren(nodes, nodes[node["children"][i]], tfm);
        }
        node["children"] = [];
    }
}

var makeGLTFSingleLevel = function(nodes) {
    var rootTfm = mat4.create();
    for (var i = 0; i < nodes.length; ++i) {
        flattenGLTFChildren(nodes, nodes[i], rootTfm);
    }
    return nodes;
}

var GLTFMaterial = function(material, textures) {
    this.baseColorFactor = [1, 1, 1, 1];
    this.baseColorTexture = null;
    // padded to float4
    this.emissiveFactor = [0, 0, 0, 1];
    this.metallicFactor = 1.0;
    this.roughnessFactor = 1.0;

    if (material["pbrMetallicRoughness"] !== undefined) {
        var pbr = material["pbrMetallicRoughness"];
        if (pbr["baseColorFactor"] !== undefined) {
            this.baseColorFactor = pbr["baseColorFactor"];
        }
        if (pbr["baseColorTexture"] !== undefined) {
            // TODO multiple texcoords
            this.baseColorTexture = textures[pbr["baseColorTexture"]["index"]];
        }
        if (pbr["metallicFactor"] !== undefined) {
            this.metallicFactor = pbr["metallicFactor"];
        }
        if (pbr["roughnessFactor"] !== undefined) {
            this.roughnessFactor = pbr["roughnessFactor"];
        }
    }
    if (material["emissiveFactor"] !== undefined) {
        this.emissiveFactor[0] = material["emissiveFactor"][0];
        this.emissiveFactor[1] = material["emissiveFactor"][1];
        this.emissiveFactor[2] = material["emissiveFactor"][2];
    }

    this.gpuBuffer = null;
    this.bindGroupLayout = null;
    this.bindGroup = null;
}

GLTFMaterial.prototype.upload = function(device) {
    var [buf, mapping] = device.createBufferMapped({
        size: (2 * 4 + 2) * 4,
        usage: GPUBufferUsage.UNIFORM,
    });
    var mappingView = new Float32Array(mapping);
    mappingView.set(this.baseColorFactor);
    mappingView.set(this.emissiveFactor, 4);
    mappingView.set([this.metallicFactor, this.roughnessFactor], 8);
    buf.unmap();
    this.gpuBuffer = buf;

    var layoutEntries = [
        {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            type: "uniform-buffer"
        }
    ];
    var bindGroupEntries = [
        {
            binding: 0,
            resource: {
                buffer: this.gpuBuffer,
            }
        }
    ];

    if (this.baseColorTexture) {
        layoutEntries.push({
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            type: "sampler"
        });
        layoutEntries.push({
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            type: "sampled-texture"
        });

        bindGroupEntries.push({
            binding: 1,
            resource: this.baseColorTexture.sampler,
        });
        bindGroupEntries.push({
            binding: 2,
            resource: this.baseColorTexture.imageView,
        });
    }

    this.bindGroupLayout = device.createBindGroupLayout({
        entries: layoutEntries
    });

    this.bindGroup = device.createBindGroup({
        layout: this.bindGroupLayout,
        entries: bindGroupEntries,
    });
}

var GLTFSampler = function(sampler, device) {
    var magFilter = sampler["magFilter"] === undefined || sampler["magFilter"] == GLTFTextureFilter.LINEAR ?
        "linear" : "nearest";
    var minFilter = sampler["minFilter"] === undefined || sampler["minFilter"] == GLTFTextureFilter.LINEAR ?
        "linear" : "nearest";

    var wrapS = "repeat";
    if (sampler["wrapS"] !== undefined) {
        if (sampler["wrapS"] == GLTFTextureFilter.REPEAT) {
            wrapS = "repeat";
        } else if (sample["wrapS"] == GLTFTextureFilter.CLAMP_TO_EDGE) {
            wrapS = "clamp-to-edge";
        } else {
            wrapS = "mirror-repeat";
        }
    }

    var wrapT = "repeat";
    if (sampler["wrapT"] !== undefined) {
        if (sampler["wrapT"] == GLTFTextureFilter.REPEAT) {
            wrapT = "repeat";
        } else if (sample["wrapT"] == GLTFTextureFilter.CLAMP_TO_EDGE) {
            wrapT = "clamp-to-edge";
        } else {
            wrapT = "mirror-repeat";
        }
    }

    this.sampler = device.createSampler({
        magFilter: magFilter,
        minFilter: minFilter,
        addressModeU: wrapS,
        addressModeV: wrapT,
    });
}

var GLTFTexture = function(sampler, image) {
    this.gltfsampler = sampler;
    this.sampler = sampler.sampler;
    this.image = image;
    this.imageView = image.createView();
}

