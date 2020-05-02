var API = {
    'DXR': {
        SHADER_IDENTIFIER_SIZE: 32,
        SHADER_RECORD_STRIDE_ALIGNMENT: 32,
        SHADER_TABLE_BYTE_ALIGNMENT: 64,
    },
    'Vulkan NV Ray Tracing': {
        SHADER_IDENTIFIER_SIZE: 16,
        SHADER_RECORD_STRIDE_ALIGNMENT: 32,
        SHADER_TABLE_BYTE_ALIGNMENT: 64,
    },
    'Vulkan KHR Ray Tracing': {
        SHADER_IDENTIFIER_SIZE: 32,
        SHADER_RECORD_STRIDE_ALIGNMENT: 32,
        SHADER_TABLE_BYTE_ALIGNMENT: 64,
    },
    'OptiX': {
        SHADER_IDENTIFIER_SIZE: 32,
        SHADER_RECORD_STRIDE_ALIGNMENT: 16,
        SHADER_TABLE_BYTE_ALIGNMENT: 16,
    },
};

var ParamType = {
    STRUCT: 1,
    FOUR_BYTE_CONSTANT: 2,
    FOUR_BYTE_CONSTANT_PAD: 3,
    GPU_HANDLE: 4,
};

var currentAPI = API['DXR'];

var shaderTable = null;
var selectedShaderRecord = null;

var sbtWidget = null;
var sbtWidgetZoom = null;
var sbtScrollRect = null;
var sbtWidgetScale = d3.scaleLinear([0, 32], [0, 78]);

var shaderRecordWidget = null;
var shaderRecordZoom = null;
var shaderRecordZoomRect = null;

var vulkanKHRSizeInput = null;
var optixStructSizeInput = null;
var instanceGeometryCountUI = null;
var sbtOffsetUI = null;
var instanceMaskUI = null;

var dxrUI = null;
var vulkanUI = null;
var vulkanKHRUI = null;
var optixUI = null;

var traceParams = {
    raySBTOffset: 0,
    raySBTStride: 1,
    missShaderIndex: 0,
    rayInstanceMask: 0xff,
};

// Each instance is just a count of how many geometries it has,
// for D3 nesting we make this just an array like [0, 1, 2]
var instances = [];
var instanceWidget = null;
var instanceContainer = null;
var selectedInstance = 0;

var alignTo = function(val, align) {
    return Math.floor((val + align - 1) / align) * align;
}

var makeTriangle = function() {
    return d3.create('svg:path')
        .attr('class', 'triangle')
        .attr('d', 'M22.5,1.7c-3.8,2.5-7.5,4.8-10.6,8c-0.1,0-0.1-0.1-0.2-0.1c0.1-0.5,0.1-1,0.3-1.4c0.5-1.1,0.6-2.3,0.3-3.5 c-0.2-0.9-0.8-1.6-1.7-2c-1.1-0.4-2.1,0-3.1,0.5C7,3.5,6.7,3.9,6.5,4.5C6,6.1,6.2,7.8,6.2,9.5c0,0.1,0,0.1,0,0.2 C6.4,10,6.2,10,6,10.1c-1.1,0.3-2.3,0.6-3.4,1c-1.1,0.4-1.8,1.3-1.6,2.6c0,0.3,0,0.6,0.1,1c0.1,0.6,0.1,1.2,0.2,1.8 c0.1,0.9-0.5,1.6-0.8,2.4c-0.5,1.1-0.4,2.3-0.3,3.4c0.1,1.2,1,1.9,1.9,2.5c0.8,0.5,0.8,0.7,0.5,1.6C2.2,27.2,2,28.1,1.8,29 c-0.1,0.4-0.1,0.8,0,1.3c0.1,0.8,0.3,1.5,0.5,2.3c0.1,0.5,0.3,0.9,0.5,1.4c0.2,0.4,0.5,0.9,0.7,1.3c0.5,1.1,5.3,5.8,6.9,6.2 c0.5,0.1,1.1,0.3,1.6,0.5c0.2,0.1,0.3,0.2,0.4,0.4c0.2,1.1-0.4,2.1-1.4,2.5c-0.8,0.3-1.5,0.8-2.2,1.2c-0.2,0.1-0.1,1.6,0.2,2.3 C9,48.4,9,48.7,9.1,48.9c0.2,0.1,4.1,0.4,4.8,0.4c0.9,0.1,20.1,0.2,22-0.5c0.6-0.2,1.2-0.6,1.8-1.1c0.6-0.5,1.1-0.9,1.8-1 c1.2-0.1,2.3-0.1,3.5-0.2c0.3,0,0.7-0.2,1-0.2c0.3,0,1.5-0.5,1.7-0.8c0.2-0.2,2.9-2,3.3-2.8c0.8-1.4,1.2-2.8,0.8-4.4 c-0.2-0.6-0.5-1.1-1.1-1.4c-0.8-0.5-1.6-0.6-2.5-0.4c-0.7,0.1-0.9-0.1-0.9-0.7c-0.1-0.6-0.1-1.2-0.1-1.7c-0.1-1.4-0.2-2.8-0.4-4.2 c-0.4-2.4-1.6-4.4-3.1-6.3c-3.3-4.1-7.3-6.4-12.7-5.5c-2.2,0.4-4.3,0.9-6.5,1.5c-0.8,0.2-1.6,0.2-2.4-0.1c-0.9-0.3-1.8-0.5-2.7-0.7 c-0.6-0.1-1.1-0.4-1.4-0.9c-0.7-0.9-1-1.8-1.2-2.9c-0.1-0.5,0.1-0.8,0.5-1.1c2.4-1.5,4.9-2.8,7.5-3.8c1.6-0.6,3.1-1.4,4.3-2.7 c0.3-0.3,0.5-0.8,0.6-1.2c0.3-2,0-3.8-1.7-5.2c-0.8-0.6-1.4-0.7-2.2-0.3C23.6,0.9,22.9,1.4,22.5,1.7z')
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('fill', 'black')
        .node();
}

var makeBLASIcon = function() {
    var n = d3.create('svg:g')
        .attr('class', 'blas');
    n.append('rect')
        .attr('width', 100)
        .attr('height', 100)
        .attr('fill', 'white')
        .attr('stroke-width', 2)
        .attr('stroke', 'black');
    n.append('rect')
        .attr('width', 35)
        .attr('height', 100)
        .attr('fill', 'lightblue')
        .attr('fill-opacity', 0.5)
        .attr('stroke-width', 2)
        .attr('stroke', 'blue');
    n.append('rect')
        .attr('x', 20)
        .attr('y', 20)
        .attr('width', 80)
        .attr('height', 50)
        .attr('fill', 'lightgreen')
        .attr('fill-opacity', 0.5)
        .attr('stroke-width', 2)
        .attr('stroke', 'green');
    return n.node();
}

var baseSBTOffset = function(inst) {
    // Compute the base SBT offset recommended for the instance,
    // not including additional stride due to multiple ray types
    var offset = 0;
    for (var i = 0; i < inst; ++i) {
        offset += instances[i].numGeometries();
    }
    return offset * traceParams.raySBTStride;
}

var ShaderParam = function(paramType, paramSize) {
    this.type = paramType;
    if (this.type == ParamType.STRUCT) {
        this.size = paramSize;
    } else if (this.type == ParamType.FOUR_BYTE_CONSTANT || this.type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
        this.size = 4;
    } else if (this.type == ParamType.GPU_HANDLE) {
        this.size = 8;
    } else {
        alert('Unrecognized ParamType');
    }
}

var ShaderRecord = function(name) {
    this.params = [];
    this.name = name;
    this.baseOffset = 0;
    // True if the user modified this instance's SBT offset, in which case we won't auto-change it
    this.userSBTOffset = false;
}

ShaderRecord.prototype.addParam = function(param) {
    if (currentAPI == API['DXR']) {
        if (param.type == ParamType.GPU_HANDLE) {
            this.params.push(param);
        } else if (param.type == ParamType.FOUR_BYTE_CONSTANT) {
            if (this.params.length == 0 || this.params[this.params.length - 1].type != ParamType.FOUR_BYTE_CONSTANT_PAD) {
                this.params.push(param);
                // DXR requires 4 byte constants to be set in pairs, so insert a padding value
                // until another constant is inserted
                this.params.push(new ShaderParam(ParamType.FOUR_BYTE_CONSTANT_PAD));
            } else {
                this.params[this.params.length - 1] = param;
            }
        } else {
            alert('Only GPU handles and 4byte constants are supported for DXR');
        }
    } else if (currentAPI == API['Vulkan NV Ray Tracing']) {
        if (param.type == ParamType.FOUR_BYTE_CONSTANT) {
            this.params.push(param);
        } else {
            alert('Only 4byte constants are support for Vulkan');
        }
    } else if (currentAPI == API['Vulkan KHR Ray Tracing']) {
        if (param.type == ParamType.STRUCT) {
            if (this.params.length == 0) {
                this.params.push(param);
            } else {
                this.params[0] = param;
            }
        } else {
            alert('Only struct params are valid for Vulkan KHR');
        }
    } else if (currentAPI == API['OptiX']) {
        if (param.type == ParamType.STRUCT) {
            if (this.params.length == 0) {
                this.params.push(param);
            } else {
                this.params[0] = param;
            }
        } else {
            alert('Only struct params are valid for OptiX');
        }
    } else {
        alert('Unrecognized API');
    }
}

ShaderRecord.prototype.setBaseOffset = function(baseOffset) {
    this.baseOffset = baseOffset;
}

ShaderRecord.prototype.size = function() {
    var size = 0;
    // Note: for optix we can only have one param, and it's a single struct 
    // of user-configurable data/size/etc.
    for (var i = 0; i < this.params.length; ++i) {
        size += this.params[i].size;
    }
    return currentAPI.SHADER_IDENTIFIER_SIZE + size;
}

ShaderRecord.prototype.removeParam = function(i) { 
    if (this.params[i].type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
        return;
    }
    var toErase = 1;

    // If the param was a padded 4byte constant, the padding is also no longer needed
    if (i != this.params.length - 1 && this.params[i].type == ParamType.FOUR_BYTE_CONSTANT
        && this.params[i + 1].type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
        toErase = 2;
    }

    this.params.splice(i, toErase);

    // For DXR: make sure no single 4byte constant entries are left in the SBT,
    // since they must come in pairs or with a 4byte padding
    if (currentAPI == API['DXR']) {
        // Remove and re-create any required 4byte padding to update the record
        for (var j = 0; j < this.params.length;) {
            if (this.params[j].type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
                this.params.splice(j, 1);
            } else {
                ++j;
            }
        }
        // Now re-insert 4byte constant padding as necessary
        for (var j = 0; j < this.params.length; ++j) {
            if (this.params[j].type == ParamType.FOUR_BYTE_CONSTANT) {
                if (j == this.params.length - 1 || this.params[j + 1].type != ParamType.FOUR_BYTE_CONSTANT) {
                    this.params.splice(j + 1, 0, new ShaderParam(ParamType.FOUR_BYTE_CONSTANT_PAD));
                }
                // We either have or just made a pair, so skip the pair
                ++j;
            }
        }
    }

    updateViews();
}

ShaderRecord.prototype.render = function() {
    var self = this;
    if (currentAPI == API['OptiX']) {
        optixStructSizeInput.value = '';
    } else {
        vulkanKHRSizeInput.value = '';
    }

    shaderRecordWidget.select('.shaderRecordDetail').remove();
    var widget = shaderRecordWidget.append('g')
        .attr('class', 'shaderRecordDetail')
        .attr('transform', 'translate(32, 140)');

    var selection = widget.selectAll('.shaderRecordTitle').data([this]);
    selection.enter()
        .append('text')
        .attr('class', 'shaderRecordTitle')
        .merge(selection)
        .text(function(d) {
            return 'Shader Record: ' + d.name + ' at ' + self.baseOffset +
                ", Size: " + d.size() + "b";
        });
    selection.exit().remove();

    var scale = d3.scaleLinear([0, this.size()], [0, this.size() * 6]);

    selection = widget.selectAll('.shaderRecordHandle').data([this]);
    selection.enter()
        .append('rect')
        .attr('class', 'shaderRecordHandle')
        .attr('y', 8)
        .attr('height', 180)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .attr('fill', 'lightgray')
        .merge(selection)
        .attr('width', scale(currentAPI.SHADER_IDENTIFIER_SIZE));
    selection.exit().remove();

    selection = widget.selectAll('.shaderRecordHandleText').data([this]);
    selection.enter()
        .append('text')
        .attr('class', 'shaderRecordHandleText')
        .attr('transform', 'rotate(-90)')
        .attr('dominant-baseline', 'middle')
        .attr('y', scale(currentAPI.SHADER_IDENTIFIER_SIZE / 2.0))
        .attr('x', -180)
        .merge(selection)
        .text('Shader Identifier');
    selection.exit().remove();

    var offset = currentAPI.SHADER_IDENTIFIER_SIZE;
    selection = widget.selectAll('.shaderRecordParam').data(this.params);
    selection.enter()
        .append('rect')
        .attr('class', 'shaderRecordParam')
        .attr('y', 8)
        .attr('height', 180)
        .attr('stroke-width', 2)
        .attr('stroke', 'gray')
        .merge(selection)
        .attr('fill', function(d) {
            if (d.type == ParamType.STRUCT) {
                if (currentAPI == API['OptiX']) {
                    optixStructSizeInput.value = d.size;
                } else {
                    vulkanKHRSizeInput.value = d.size;
                }
                return '#fdc086';
            }
            if (d.type == ParamType.FOUR_BYTE_CONSTANT) {
                return '#ffff99'
            }
            if (d.type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
                return 'lightgray'
            }
            if (d.type == ParamType.GPU_HANDLE) {
                return '#7fc97f';
            }
            return 'gray';
        })
        .attr('width', function(d) {
            return scale(d.size);
        })
        .attr('x', function(d) {
            var pos = offset;
            offset += d.size;
            return scale(pos);
        })
        .on('dblclick', function(d, i) {
            self.removeParam(i);
            updateViews();
        });
    selection.exit().remove();

    offset = currentAPI.SHADER_IDENTIFIER_SIZE;
    selection = widget.selectAll('.shaderRecordParamText').data(this.params);
    selection.enter()
        .append('text')
        .attr('class', 'shaderRecordParamText')
        .attr('transform', 'rotate(-90)')
        .attr('dominant-baseline', 'middle')
        .attr('y', function(d) {
            var pos = offset + d.size / 2.0;
            offset += d.size;
            return scale(pos);
        })
        .attr('x', -180)
        .merge(selection)
        .text(function(d) {
            if (d.type == ParamType.STRUCT) {
                if (currentAPI == API['OptiX']) {
                    return 'Struct (' + d.size + 'b)';
                } else {
                    return 'Shader Rec. Buf. (' + d.size + 'b)';
                }
            }
            if (d.type == ParamType.FOUR_BYTE_CONSTANT) {
                return '4-byte Constant'
            }
            if (d.type == ParamType.FOUR_BYTE_CONSTANT_PAD) {
                return '4-byte Pad'
            }
            if (d.type == ParamType.GPU_HANDLE) {
                return 'GPU Handle';
            }
            return 'Unknown??';
        })
        .on('dblclick', function(d, i) {
            self.removeParam(i);
            updateViews();
        });
    selection.exit().remove();

    offset = currentAPI.SHADER_IDENTIFIER_SIZE;
    var tickValues = [0];
    for (var i = 0; i < this.params.length; ++i) {
        tickValues.push(offset);
        offset += this.params[i].size;
    }
    tickValues.push(offset);
    var byteAxis = d3.axisBottom(scale).tickValues(tickValues);
    widget.append('g').attr('transform', 'translate(0, 188)').call(byteAxis);
}

var ShaderTable = function() {
    var sampleHG = new ShaderRecord('hitgroup');
    var sampleMiss = new ShaderRecord('miss');

    this.raygen = new ShaderRecord('raygen');
    this.hitGroups = [sampleHG];
    this.missShaders = [sampleMiss];

    this.hgOffset = 0;
    this.hgStride = 0;

    this.missOffset = 0;
    this.missStride = 0;

    selectedShaderRecord = this.raygen;
}

ShaderTable.prototype.clearParams = function() {
    this.raygen.params = [];
    for (var i = 0; i < this.hitGroups.length; ++i) {
        this.hitGroups[i].params = [];
    }
    for (var i = 0; i < this.missShaders.length; ++i) {
        this.missShaders[i].params = [];
    }
}

ShaderTable.prototype.size = function() {
    var raygenSize = alignTo(this.raygen.size(), currentAPI.SHADER_RECORD_STRIDE_ALIGNMENT);
    document.getElementById('raygenSize').innerHTML = raygenSize + 'b';

    this.hgOffset = alignTo(raygenSize, currentAPI.SHADER_TABLE_BYTE_ALIGNMENT);
    this.hgStride = 0;
    for (var i = 0; i < this.hitGroups.length; ++i) {
        this.hgStride = Math.max(this.hgStride, alignTo(this.hitGroups[i].size(), currentAPI.SHADER_RECORD_STRIDE_ALIGNMENT)); 
    }

    document.getElementById('hitGroupStride').innerHTML = this.hgStride + 'b';
    document.getElementById('hitGroupOffset').innerHTML = this.hgOffset + 'b';

    this.missOffset = alignTo(this.hgOffset + this.hgStride * this.hitGroups.length, currentAPI.SHADER_TABLE_BYTE_ALIGNMENT);
    this.missStride = 0;
    for (var i = 0; i < this.missShaders.length; ++i) {
        this.missStride = Math.max(this.missStride, alignTo(this.missShaders[i].size(), currentAPI.SHADER_RECORD_STRIDE_ALIGNMENT)); 
    }
    document.getElementById('missStride').innerHTML = this.missStride + 'b';
    document.getElementById('missOffset').innerHTML = this.missOffset + 'b';

    return this.missOffset + this.missStride * this.missShaders.length;
}

ShaderTable.prototype.render = function() {
    var self = this;
    // Update strides and offsets
    this.size();

    // Draw the raygen program
    var raygenSelection = sbtWidget.selectAll('.raygen').data([this.raygen]);
    raygenSelection.enter()
        .append('rect')
        .attr('class', 'raygen')
        .attr('x', 0)
        .attr('y', 30)
        .attr('height', 64)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .merge(raygenSelection)
        .attr('fill', function(d, i) {
            if (selectedShaderRecord == d) {
                return '#e6550d';
            }
            return 'white';
        })
        .on('click', function(d) {
            selectedShaderRecord = d;
            updateViews();
        })
        .attr('width', sbtWidgetScale(this.raygen.size()));

    raygenSelection.exit().remove();

    var rgTextSelection = sbtWidget.selectAll('.rgText').data([this.raygen]);
    rgTextSelection.enter()
        .append('text')
        .attr('class', 'rgText')
        .attr('y', 62)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text('RG')
        .merge(rgTextSelection)
        .attr('x', sbtWidgetScale(this.raygen.size() / 2.0))
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .on('click', function(d) {
            selectedShaderRecord = d;
            updateViews();
        });
    rgTextSelection.exit().remove();

    var instanceHgRange = instances[selectedInstance].hitGroupRange();

    var clickHitGroup = function(d, i) {
        selectedShaderRecord = d;
        // If there's an instance that uses this hit group, select it as well
        for (var j = 0; j < instances.length; ++j) {
            var hgRange = instances[j].hitGroupRange();
            if (i >= hgRange[0] && i <= hgRange[1]) {
                selectedInstance = j;
            }
        }
        updateViews();
    };

    var dblclickHitGroup = function(d, i) {
        if (self.hitGroups.length == 1) {
            return;
        }
        self.hitGroups.splice(i, 1);

        if (selectedShaderRecord == d) {
            if (i < self.hitGroups.length) {
                selectedShaderRecord = self.hitGroups[i]
            } else {
                selectedShaderRecord = self.hitGroups[self.hitGroups.length - 1];
            }
        }

        // Reset the zoom for the shader record
        shaderRecordZoomRect.call(shaderRecordZoom.transform, d3.zoomIdentity);
        updateViews();
    }

    var hgSelection = sbtWidget.selectAll('.hitgroup').data(this.hitGroups);
    hgSelection.enter()
        .append('rect')
        .attr('class', 'hitgroup')
        .attr('y', 30)
        .attr('height', 64)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .merge(hgSelection)
        .attr('fill', function(d, i) {
            if (selectedShaderRecord == d) {
                return '#e6550d';
            }
            if (i >= instanceHgRange[0] && i <= instanceHgRange[1]) {
                return '#9ecae1';
            }
            return '#3182bd'
        })
        .on('click', clickHitGroup)
        .on('dblclick', dblclickHitGroup)
        .attr('x', function(d, i) {
            var pos = self.hgStride * i + self.hgOffset;
            d.setBaseOffset(pos);
            return sbtWidgetScale(pos);
        })
        .attr('width', function(d) {
            return sbtWidgetScale(d.size());
        });

    hgSelection.exit().remove();

    var hgTextSelection = sbtWidget.selectAll('.hgText').data(this.hitGroups)
    hgTextSelection.enter()
        .append('text')
        .attr('class', 'hgText')
        .attr('y', 62)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text('HG')
        .merge(hgTextSelection)
        .attr('x', function(d, i) {
            var pos = self.hgStride * i + self.hgOffset;
            return sbtWidgetScale(pos + d.size() / 2.0);
        })
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .on('click', clickHitGroup)
        .on('dblclick', dblclickHitGroup);
    hgTextSelection.exit().remove();

    var clickMissShader = function(d, i) {
        selectedShaderRecord = d;
        document.getElementById('missShaderIndex').value = i;
        updateTraceCall();
        updateViews();
    };
    var dblClickMissShader = function(d, i) {
        if (self.missShaders.length == 1) {
            return;
        }
        self.missShaders.splice(i, 1);

        if (selectedShaderRecord == d) {
            if (i < self.missShaders.length) {
                selectedShaderRecord = self.missShaders[i]
            } else {
                selectedShaderRecord = self.missShaders[self.missShaders.length - 1];
            }
        }

        // Reset the zoom for the shader record
        shaderRecordZoomRect.call(shaderRecordZoom.transform, d3.zoomIdentity);
        updateViews();
    }

    var missSelection = sbtWidget.selectAll('.miss').data(this.missShaders);
    missSelection.enter()
        .append('rect')
        .attr('class', 'miss')
        .attr('y', 30)
        .attr('height', 64)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .merge(missSelection)
        .attr('fill', function(d, i) {
            if (selectedShaderRecord == d) {
                return '#e6550d';
            }
            if (i == traceParams.missShaderIndex) {
                return '#bcbddc';
            }
            return '#756bb1';
        })
        .on('click', clickMissShader)
        .on('dblclick', dblClickMissShader)
        .attr('x', function(d, i) {
            var pos = self.missStride * i + self.missOffset;
            d.setBaseOffset(pos);
            return sbtWidgetScale(pos);
        })
        .attr('width', function(d) {
            return sbtWidgetScale(d.size());
        });

    missSelection.exit().remove();

    var missTextSelection = sbtWidget.selectAll('.missText').data(this.missShaders)
    missTextSelection.enter()
        .append('text')
        .attr('class', 'missText')
        .attr('y', 62)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text('Miss')
        .merge(missTextSelection)
        .attr('x', function(d, i) {
            var pos = self.missStride * i + self.missOffset;
            return sbtWidgetScale(pos + d.size() / 2.0);
        })
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        })
        .on('click', clickMissShader)
        .on('dblclick', dblClickMissShader);
    missTextSelection.exit().remove();
}

var Geometry = function(instance) {
    this.instance = instance;
}

var Instance = function() {
    this.geometries = [new Geometry(this)];
    this.mask = 0xff;
    this.sbtOffset = 0;
}

Instance.prototype.setNumGeometries = function(n) {
    var self = this;
    this.geometries = Array.apply(null, {length: n})
        .map(Function.call, function() { return new Geometry(self); });
}

Instance.prototype.numGeometries = function() {
    return this.geometries.length;
}

Instance.prototype.hitgroupForGeometry = function(geomIdx) {
    return traceParams.raySBTOffset + traceParams.raySBTStride * geomIdx + this.sbtOffset;
}

Instance.prototype.hitGroupRange = function() {
    var h = [this.sbtOffset, traceParams.raySBTStride * this.geometries.length + this.sbtOffset - 1];
    h[1] = Math.max(h[1], 0);
    return h;
}

window.onload = function() {
    optixStructSizeInput = document.getElementById('structParamSize');
    vulkanKHRSizeInput = document.getElementById('shaderRecordEXT');
    instanceGeometryCountUI = document.getElementById('geometryCount');
    sbtOffsetUI = document.getElementById('instanceSbtOffset');
    instanceMaskUI = document.getElementById('instanceMask');

    dxrUI = [document.getElementById('dxrParamsUI'), document.getElementById('dxrTrace')];
    vulkanUI = [document.getElementById('vulkanParamsUI'), document.getElementById('vulkanTrace')];
    vulkanKHRUI = [document.getElementById('vulkanKHRParamsUI'), document.getElementById('vulkanKHRTrace')];
    optixUI = [document.getElementById('optixParamsUI'), document.getElementById('optixTrace')];

    // TODO: Something to handle variable size viewports,
    // need to get the w/h of the view
    var svg = d3.select('#sbtWidget');
    sbtWidget = svg.append('g')
        .attr('transform', 'translate(10, 0)');

    sbtWidget.append('g')
        .attr('class', 'sbtWidgetAxis')
        .attr('transform', 'translate(0, 94)');

    sbtScrollRect = svg.append('rect')
        .attr('y', '94')
        .attr('width', '800')
        .attr('height', '22')
        .attr('fill', 'white')
        .attr('opacity', '0')
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'w-resize');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        });

    sbtWidgetZoom = d3.zoom()
        .on('zoom', function() { 
            sbtWidget.attr('transform', 'translate(' + d3.event.transform.x + ', 0)');
        });
    sbtScrollRect.call(sbtWidgetZoom)
        .on('wheel.zoom', null);

    shaderRecordWidget = svg.append('g');
    shaderRecordZoomRect = svg.append('rect')
        .attr('y', '328')
        .attr('width', '800')
        .attr('height', '22')
        .attr('fill', 'white')
        .attr('opacity', '0')
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'w-resize');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        });

    shaderRecordZoom = d3.zoom()
        .on('zoom', function() { 
            shaderRecordWidget.attr('transform', 'translate(' + d3.event.transform.x + ', 0)');
        });
    shaderRecordZoomRect.call(shaderRecordZoom).on('wheel.zoom', null);

    instanceWidget = d3.select('#instanceWidget');
    var instanceScrollRect = instanceWidget.append('rect')
        .attr('width', 800)
        .attr('height', 400)
        .attr('fill', 'white');
    instanceContainer = instanceWidget.append('g');

    instanceScrollRect.call(d3.zoom().on('zoom', function() {
            instanceContainer.attr('transform', d3.event.transform);
        }))
        .on('wheel.zoom', null)
        .on('dblclick.zoom', null);

    shaderTable = new ShaderTable();
    instances = [new Instance()];
    selectAPI()
}

var selectAPI = function() {
    var apiName = document.getElementById('selectAPI').value
    currentAPI = API[apiName];

    if (apiName == 'DXR') {
        for (var i = 0; i < 2; ++i) {
            dxrUI[i].setAttribute('style', 'display:block');
            vulkanUI[i].setAttribute('style', 'display:none');
            vulkanKHRUI[i].setAttribute('style', 'display:none');
            optixUI[i].setAttribute('style', 'display:none');
        }
    } else if (apiName == 'Vulkan NV Ray Tracing') {
        for (var i = 0; i < 2; ++i) {
            dxrUI[i].setAttribute('style', 'display:none');
            vulkanUI[i].setAttribute('style', 'display:block');
            vulkanKHRUI[i].setAttribute('style', 'display:none');
            optixUI[i].setAttribute('style', 'display:none');
        }
    } else if (apiName == 'Vulkan KHR Ray Tracing') {
        for (var i = 0; i < 2; ++i) {
            dxrUI[i].setAttribute('style', 'display:none');
            vulkanUI[i].setAttribute('style', 'display:none');
            vulkanKHRUI[i].setAttribute('style', 'display:block');
            optixUI[i].setAttribute('style', 'display:none');
        }
    } else {
        for (var i = 0; i < 2; ++i) {
            dxrUI[i].setAttribute('style', 'display:none');
            vulkanUI[i].setAttribute('style', 'display:none');
            vulkanKHRUI[i].setAttribute('style', 'display:none');
            optixUI[i].setAttribute('style', 'display:block');
        }
    }

    shaderTable.clearParams();
    updateViews();
}

var updateViews = function() {
    var sbtSize = shaderTable.size();

    var axisLen = Math.ceil(sbtSize / 32.0);
    sbtWidgetScale = d3.scaleLinear([0, 32 * axisLen], [0, 78 * axisLen]);

    var tickValues = [];
    for (var i = 0; i < axisLen + 1; ++i) {
        tickValues.push(32 * i);
    }

    var byteAxis = d3.axisBottom(sbtWidgetScale).tickValues(tickValues);
    sbtWidget.select('.sbtWidgetAxis').call(byteAxis);
    shaderTable.render();
    selectedShaderRecord.render();

    updateInstanceView();

    var alertDisplay = document.getElementById('missOutOfBounds');
    alertDisplay.setAttribute('style', 'display:none')
    if (traceParams.missShaderIndex >= shaderTable.missShaders.length) {
        alertDisplay.innerHTML = 'Miss accesses out of bounds miss shader index ' +
            traceParams.missShaderIndex + ' @ ' +
            (traceParams.missShaderIndex * shaderTable.missStride + shaderTable.missOffset) + 'b'
        alertDisplay.setAttribute('style', 'display:block')
    }

    alertDisplay = document.getElementById('hgOutOfBounds');
    var hgRange = instances[selectedInstance].hitGroupRange();
    alertDisplay.setAttribute('style', 'display:none')
    if (hgRange[1] >= shaderTable.hitGroups.length) {
        alertDisplay.innerHTML = 'The instance\'s geometry accesses out of bounds hit groups. ' +
            'Instance uses hit groups ' + hgRange[0] + ' to ' + hgRange[1] +
            ' (' + (hgRange[0] * shaderTable.hgStride + shaderTable.hgOffset) + 'b to ' +
            (hgRange[1] * shaderTable.hgStride + shaderTable.hgOffset) + 'b)' +
            ', but valid range is only 0 to ' + (shaderTable.hitGroups.length - 1) +
            ' (' + ((shaderTable.hitGroups.length - 1) * shaderTable.hgStride + shaderTable.hgOffset) + 'b).';
        alertDisplay.setAttribute('style', 'display:block')
    }
}

var zoomToShaderRecord = function() {
    // TODO: If the record is already visible, maybe don't pan to it
    var x = -sbtWidgetScale(selectedShaderRecord.baseOffset) + sbtWidgetScale(selectedShaderRecord.size()) / 2.0;
    sbtScrollRect.transition()
        .duration(200)
        .ease(d3.easeLinear)
        .call(sbtWidgetZoom.transform,
            d3.zoomIdentity.translate(x, 0));
}

var updateInstanceView = function() {
    for (var i = 0; i < instances.length; ++i) {
        if (!instances[i].userSBTOffset) {
            instances[i].sbtOffset = baseSBTOffset(i);
        }
    }
    instanceGeometryCountUI.value = instances[selectedInstance].numGeometries();
    sbtOffsetUI.value = instances[selectedInstance].sbtOffset;
    instanceMaskUI.value = instances[selectedInstance].mask.toString(16);

    var highlight = instanceContainer.selectAll('.highlight')
        .data([selectedInstance]);
    highlight.enter()
        .append('rect')
        .attr('class', 'highlight')
        .merge(highlight)
        .attr('x', 4)
        .attr('y', function() { return 4 + selectedInstance * 116; })
        .attr('width', function() { return 116 + instances[selectedInstance].numGeometries() * 80 + 8; })
        .attr('height', 108)
        .attr('fill', '#9ecae1');

    highlight.exit().remove();

    var blasSelection = instanceContainer
        .selectAll('.blas')
        .data(instances);

    var allBlas = blasSelection.enter()
        .append(function() { return makeBLASIcon(); })
        .attr('transform', function(d, i) {
            return 'translate(8, ' + (i * 116 + 8) + ')';
        })
        .merge(blasSelection)
        .on('click', function(d, i) {
            selectedInstance = i;
            updateViews();
        })
        .on('dblclick', function(d, i) {
            if (instances.length == 1) {
                return;
            }
            instances.splice(i, 1);

            if (selectedInstance > 0) {
                if (selectedInstance >= instances.length) {
                    selectedInstance = instances.length - 1;
                }
            }

            updateViews();
        })
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('cursor', 'default');
        });

    var triangleSelection = allBlas.selectAll('.triangle')
        .data(function(d) { return d.geometries; });

    triangleSelection.enter()
        .append(function() { return makeTriangle(); })
        .merge(triangleSelection)
        .attr('fill', function(d, i) {
            var hg = d.instance.hitgroupForGeometry(i);
            if (hg < shaderTable.hitGroups.length) {
                return 'white';
            }
            return 'red';
        })
        .attr('transform', function(d, i) {
            return 'translate(' + (116 + i * 80) + ', 10) scale(1.5)';
        })
        .on('click', function(d, i) {
            var alertDisplay = document.getElementById('hgOutOfBounds');
            var hg = d.instance.hitgroupForGeometry(i);
            if (hg < shaderTable.hitGroups.length) {
                selectedShaderRecord = shaderTable.hitGroups[hg];
                zoomToShaderRecord();
                alertDisplay.setAttribute('style', 'display:none')
                updateViews();
            } else {
                alertDisplay.innerHTML = 'Geometry accesses out of bounds hit group ' +
                    hg + ' @ ' + (hg * shaderTable.hgStride) + 'b';
                alertDisplay.setAttribute('style', 'display:block')
            }
        });
    
    var geomIDSelection = allBlas.selectAll('.geomID')
        .data(function(d) { return d.geometries; });

    geomIDSelection.enter()
        .append('text')
        .attr('class', 'geomID')
        .merge(geomIDSelection)
        .text(function(d, i) {
            return i;
        })
        .attr('x', function(d, i) {
            return (112 + i * 80);
        })
        .attr('y', 20);

    geomIDSelection.exit().remove();
    triangleSelection.exit().remove();
    blasSelection.exit().remove();

    var inactiveInstances = [];
    for (var i = 0; i < instances.length; ++i) {
        if (!(instances[i].mask & traceParams.rayInstanceMask)) {
            inactiveInstances.push(i);
        }
    }

    var inactiveHighlight = instanceContainer.selectAll('.instanceMaskedOut')
        .data(inactiveInstances);
    inactiveHighlight.enter()
        .append('rect')
        .attr('class', 'instanceMaskedOut')
        .merge(inactiveHighlight)
        .attr('x', 4)
        .attr('y', function(d) { return 4 + d * 116; })
        .attr('width', function(d) { return 116 + instances[d].numGeometries() * 80 + 8; })
        .attr('height', 108)
        .attr('fill', 'gray')
        .attr('opacity', 0.5);
    inactiveHighlight.exit().remove();
}

var addShaderRecord = function(defaultName) {
    var nameInput = document.getElementById('shaderRecordName');
    if (nameInput.value == '') {
        nameInput.value = defaultName;
    }

    selectedShaderRecord = new ShaderRecord(nameInput.value);
    if (defaultName == 'hitgroup') {
        shaderTable.hitGroups.push(selectedShaderRecord);
    } else {
        shaderTable.missShaders.push(selectedShaderRecord);
    }

    updateViews();
    nameInput.value = '';
}

var addConstantParam = function() {
    selectedShaderRecord.addParam(new ShaderParam(ParamType.FOUR_BYTE_CONSTANT));

    updateViews();
}

var addGPUHandleParam = function() {
    selectedShaderRecord.addParam(new ShaderParam(ParamType.GPU_HANDLE));

    updateViews();
}

var addStructParam = function(elem) {
    if (elem.value == '' || elem.value == 0) {
        selectedShaderRecord.params = [];
    } else {
        selectedShaderRecord.addParam(new ShaderParam(ParamType.STRUCT, parseInt(elem.value)));
    }

    updateViews();
}

var updateInstance = function() {
    instances[selectedInstance].setNumGeometries(parseInt(instanceGeometryCountUI.value));
    var userSBTOffset = parseInt(sbtOffsetUI.value);
    if (userSBTOffset != instances[selectedInstance].sbtOffset) {
        instances[selectedInstance].sbtOffset = userSBTOffset;
        instances[selectedInstance].userSBTOffset = true;
    }

    var instMaskInput = document.getElementById('instanceMask');
    var val = 0;
    if (instMaskInput.value != undefined && instMaskInput.value != '') {
        val = parseInt(instMaskInput.value, 16);
        val = Math.min(255, Math.max(1, val));
    }
    instances[selectedInstance].mask = val;
    instMaskInput.value = val;
    document.getElementById('instanceMask').value = val.toString(16);

    updateViews();
}

var setInstanceSBTOffset = function() {
    instances[selectedInstance].userSBTOffset = false;
    instances[selectedInstance].sbtOffset = baseSBTOffset(selectedInstance);
    updateViews();
}

var addInstance = function() {
    instances.push(new Instance());
    updateViews();
}

var updateTraceCall = function() {
    traceParams.raySBTOffset = parseInt(document.getElementById('raySBTOffset').value);
    traceParams.raySBTStride = parseInt(document.getElementById('raySBTStride').value);
    traceParams.missShaderIndex = parseInt(document.getElementById('missShaderIndex').value);

    var instMaskInput = document.getElementById('rayInstanceMask');
    var val = 0;
    if (instMaskInput.value != undefined && instMaskInput.value != '') {
        val = parseInt(instMaskInput.value, 16);
        val = Math.min(255, Math.max(0, val));
    }
    traceParams.rayInstanceMask = val;

    document.getElementById('rayInstanceMask').value = traceParams.rayInstanceMask.toString(16);

    d3.selectAll('#raySBTOffsetVal').html(traceParams.raySBTOffset);
    d3.selectAll('#raySBTStrideVal').html(traceParams.raySBTStride);
    d3.selectAll('#missShaderIndexVal').html(traceParams.missShaderIndex);
    d3.selectAll('#instanceMaskVal').html('0x' + traceParams.rayInstanceMask.toString(16));

    updateViews();
}

var showMissShader = function() {
    if (traceParams.missShaderIndex < shaderTable.missShaders.length) {
        selectedShaderRecord = shaderTable.missShaders[traceParams.missShaderIndex];
        zoomToShaderRecord();
    }
    updateViews();
}

