var cubeStrip = [
	1, 1, 0,
	0, 1, 0,
	1, 1, 1,
	0, 1, 1,
	0, 0, 1,
	0, 1, 0,
	0, 0, 0,
	1, 1, 0,
	1, 0, 0,
	1, 1, 1,
	1, 0, 1,
	0, 0, 1,
	1, 0, 0,
	0, 0, 0
];

var vertShader =
"#version 300 es\n" +
"layout(location=0) in vec3 pos;" +
"uniform mat4 proj_view;" +
"uniform highp vec3 eye_pos;" +
"uniform highp vec3 volume_scale;" +
"out vec3 vray_dir;" +
"flat out highp vec3 transformed_eye;" +
"void main(void) {" +
	"highp vec3 volume_translation = vec3(0.5) - volume_scale * 0.5;" +
	"transformed_eye = (eye_pos - volume_translation) / volume_scale;" +
	// TODO: For non-uniform size volumes we need to transform them differently as well
	// to center them properly
	"vray_dir = pos - transformed_eye;" +
	"gl_Position = proj_view * vec4(pos * volume_scale + volume_translation, 1);" +
"}";

var fragShader =
"#version 300 es\n" +
"uniform highp sampler3D volume;" +
"uniform highp sampler2D colormap;" +
"uniform highp ivec3 volume_dims;" +
"uniform highp vec3 eye_pos;" +
"uniform highp float dt_scale;" +
"in highp vec3 vray_dir;" +
"flat in highp vec3 transformed_eye;" +
"out highp vec4 color;" +

"highp vec2 intersectBox(highp vec3 orig, highp vec3 dir) {" +
	"const highp vec3 box_min = vec3(0);" +
	"const highp vec3 box_max = vec3(1);" +
	"highp vec3 inv_dir = 1.0 / dir;" +
	"highp vec3 tmin_tmp = (box_min - orig) * inv_dir;" +
	"highp vec3 tmax_tmp = (box_max - orig) * inv_dir;" +
	"highp vec3 tmin = min(tmin_tmp, tmax_tmp);" +
	"highp vec3 tmax = max(tmin_tmp, tmax_tmp);" +
	"highp float t0 = max(tmin.x, max(tmin.y, tmin.z));" +
	"highp float t1 = min(tmax.x, min(tmax.y, tmax.z));" +
	"return vec2(t0, t1);" +
"}" +

// Pseudo-random number gen from
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/
// with some tweaks for the range of values
"highp float wang_hash(highp int seed) {" +
	"seed = (seed ^ 61) ^ (seed >> 16);" +
	"seed *= 9;" +
	"seed = seed ^ (seed >> 4);" +
	"seed *= 0x27d4eb2d;" +
	"seed = seed ^ (seed >> 15);" +
	"return float(seed % 2147483647) / float(2147483647);" +
"}" +

"void main(void) {" +
	"highp vec3 ray_dir = normalize(vray_dir);" +
	"highp vec2 t_hit = intersectBox(transformed_eye, ray_dir);" +
	"if (t_hit.x > t_hit.y) {" +
		"discard;" +
	"}" +
	"t_hit.x = max(t_hit.x, 0.0);" +
	"highp vec3 dt_vec = 1.0 / (vec3(volume_dims) * abs(ray_dir));" +
	"highp float dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));" +
	"highp float offset = wang_hash(int(gl_FragCoord.x + 640.0 * gl_FragCoord.y));" +
	"highp vec3 p = transformed_eye + (t_hit.x + offset * dt) * ray_dir;" +
	"for (highp float t = t_hit.x; t < t_hit.y; t += dt) {" +
		"highp float val = texture(volume, p).r;" +
		"highp vec4 val_color = vec4(texture(colormap, vec2(val, 0.5)).rgb, val);"+
		"color.rgb += (1.0 - color.a) * val_color.a * val_color.rgb;" +
		"color.a += (1.0 - color.a) * val_color.a;" +
		"if (color.a >= 0.95) {" +
			"break;" +
		"}" +
		"p += ray_dir * dt;" +
	"}" +
"}";

var gl = null;
var volumeTexture = null;
var colormapTex = null;
var fileRegex = /.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/;
var proj = null;
var camera = null;
var projView = null;
var projViewLoc = null;
var volumeScaleLoc = null;
var volumeDimsLoc = null;
var dtScaleLoc = null;
var tabFocused = true;
var newVolumeUpload = true;
var targetFrameTime = 32;
var samplingRate = 1.0;
var WIDTH = 640;
var HEIGHT = 480;
const center = vec3.set(vec3.create(), 0.5, 0.5, 0.5);

var volumes = {
	"Fuel": "7d87jcsh0qodk78/fuel_64x64x64_uint8.raw",
	"Neghip": "zgocya7h33nltu9/neghip_64x64x64_uint8.raw",
	"Hydrogen Atom": "jwbav8s3wmmxd5x/hydrogen_atom_128x128x128_uint8.raw",
	"Boston Teapot": "w4y88hlf2nbduiv/boston_teapot_256x256x178_uint8.raw",
	"Engine": "ld2sqwwd3vaq4zf/engine_256x256x128_uint8.raw",
	"Bonsai": "rdnhdxmxtfxe0sa/bonsai_256x256x256_uint8.raw",
	"Foot": "ic0mik3qv4vqacm/foot_256x256x256_uint8.raw",
	"Skull": "5rfjobn0lvb7tmo/skull_256x256x256_uint8.raw",
	"Aneurysm": "3ykigaiym8uiwbp/aneurism_256x256x256_uint8.raw",
};

var colormaps = {
	"Cool Warm": "colormaps/cool-warm-paraview.png",
	"Matplotlib Plasma": "colormaps/matplotlib-plasma.png",
	"Matplotlib Virdis": "colormaps/matplotlib-virdis.png",
	"Rainbow": "colormaps/rainbow.png",
	"Samsel Linear Green": "colormaps/samsel-linear-green.png",
	"Samsel Linear YGB 1211G": "colormaps/samsel-linear-ygb-1211g.png",
};

var loadVolume = function(file, onload) {
	var m = file.match(fileRegex);
	var volDims = [parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];
	
	var url = "https://www.dl.dropboxusercontent.com/s/" + file + "?dl=1";
	var req = new XMLHttpRequest();
	var loadingProgressText = document.getElementById("loadingText");
	var loadingProgressBar = document.getElementById("loadingProgressBar");

	loadingProgressText.innerHTML = "Loading Volume";
	loadingProgressBar.setAttribute("style", "width: 0%");

	req.open("GET", url, true);
	req.responseType = "arraybuffer";
	req.onprogress = function(evt) {
		var vol_size = volDims[0] * volDims[1] * volDims[2];
		var percent = evt.loaded / vol_size * 100;
		loadingProgressBar.setAttribute("style", "width: " + percent.toFixed(2) + "%");
	};
	req.onerror = function(evt) {
		loadingProgressText.innerHTML = "Error Loading Volume";
		loadingProgressBar.setAttribute("style", "width: 0%");
	};
	req.onload = function(evt) {
		loadingProgressText.innerHTML = "Loaded Volume";
		loadingProgressBar.setAttribute("style", "width: 100%");
		var dataBuffer = req.response;
		if (dataBuffer) {
			dataBuffer = new Uint8Array(dataBuffer);
			onload(file, dataBuffer);
		} else {
			alert("Unable to load buffer properly from volume?");
			console.log("no buffer?");
		}
	};
	req.send();
}

var selectVolume = function() {
	var selection = document.getElementById("volumeList").value;
	window.location.hash = "#" + selection;

	loadVolume(volumes[selection], function(file, dataBuffer) {
		var m = file.match(fileRegex);
		var volDims = [parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];

		var tex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_3D, tex);
		gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R8, volDims[0], volDims[1], volDims[2]);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
			volDims[0], volDims[1], volDims[2],
			gl.RED, gl.UNSIGNED_BYTE, dataBuffer);

		gl.uniform3iv(volumeDimsLoc, volDims);
		var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
		var volScale = [volDims[0] / longestAxis, volDims[1] / longestAxis,
			volDims[2] / longestAxis];
		gl.uniform3fv(volumeScaleLoc, volScale);

		newVolumeUpload = true;
		if (!volumeTexture) {
			volumeTexture = tex;
			setInterval(function() {
				// Save them some battery if they're not viewing the tab
				if (document.hidden) {
					return;
				}
				var startTime = new Date();
				gl.clearColor(0.0, 0.0, 0.0, 0.0);
				gl.clear(gl.COLOR_BUFFER_BIT);

				// Reset the sampling rate and camera for new volumes
				if (newVolumeUpload) {
					camera = new ArcballCamera(center, 2, [WIDTH, HEIGHT]);
					samplingRate = 1.0;
					gl.uniform1f(dtScaleLoc, samplingRate);
				}
				projView = mat4.mul(projView, proj, camera.camera);
				gl.uniformMatrix4fv(projViewLoc, false, projView);

				var eye = [camera.invCamera[12], camera.invCamera[13], camera.invCamera[14]];
				gl.uniform3fv(eyePosLoc, eye);

				gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 3);
				// Wait for rendering to actually finish
				gl.finish();
				var endTime = new Date();
				var renderTime = endTime - startTime;
				var targetSamplingRate = renderTime / targetFrameTime;

				// If we're dropping frames, decrease the sampling rate
				if (!newVolumeUpload && targetSamplingRate > samplingRate) {
					samplingRate = 0.5 * samplingRate + 0.5 * targetSamplingRate;
					gl.uniform1f(dtScaleLoc, samplingRate);
				}
				newVolumeUpload = false;
				startTime = endTime;
			}, targetFrameTime);
		} else {
			gl.deleteTexture(volumeTexture);
			volumeTexture = tex;
		}
	});
}

var selectColormap = function() {
	var selection = document.getElementById("colormapList").value;
	var colormapImage = new Image();
	colormapImage.onload = function() {
		gl.activeTexture(gl.TEXTURE1);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
			gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);
	};
	colormapImage.src = colormaps[selection];
}

window.onload = function(){
	fillVolumeSelector();
	fillcolormapSelector();

	var canvas = document.getElementById("glcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}
	WIDTH = canvas.getAttribute("width");
	HEIGHT = canvas.getAttribute("height");

	proj = mat4.perspective(mat4.create(), 60 * Math.PI / 180.0,
		WIDTH / HEIGHT, 0.1, 100);

	camera = new ArcballCamera(center, 2, [WIDTH, HEIGHT]);

	// Register mouse and touch listeners
	registerEventHandlers(canvas);

	// Setup VAO and VBO to render the cube to run the raymarching shader
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	var shader = compileShader(vertShader, fragShader);
	gl.useProgram(shader);

	eyePosLoc = gl.getUniformLocation(shader, "eye_pos");
	projViewLoc = gl.getUniformLocation(shader, "proj_view");
	volumeScaleLoc = gl.getUniformLocation(shader, "volume_scale");
	volumeDimsLoc = gl.getUniformLocation(shader, "volume_dims");
	dtScaleLoc = gl.getUniformLocation(shader, "dt_scale");
	projView = mat4.create();

	gl.uniform1i(gl.getUniformLocation(shader, "volume"), 0);
	gl.uniform1i(gl.getUniformLocation(shader, "colormap"), 1);
	gl.uniform1f(dtScaleLoc, 1.0);

	// Setup required OpenGL state for drawing the back faces and
	// composting with the background color
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	// See if we were linked to a datset
	if (window.location.hash) {
		var linkedDataset = decodeURI(window.location.hash.substr(1));
		if (linkedDataset in volumes) {
			document.getElementById("volumeList").value = linkedDataset;
		}
	}

	// Load the default colormap and upload it, after which we
	// load the default volume.
	var colormapImage = new Image();
	colormapImage.onload = function() {
		var colormap = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, colormap);
		gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 180, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
			gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);

		selectVolume();
	};
	colormapImage.src = "colormaps/cool-warm-paraview.png";
}

var fillVolumeSelector = function() {
	var selector = document.getElementById("volumeList");
	for (v in volumes) {
		var opt = document.createElement("option");
		opt.value = v;
		opt.innerHTML = v;
		selector.appendChild(opt);
	}
}

var fillcolormapSelector = function() {
	var selector = document.getElementById("colormapList");
	for (p in colormaps) {
		var opt = document.createElement("option");
		opt.value = p;
		opt.innerHTML = p;
		selector.appendChild(opt);
	}
}

var registerEventHandlers = function(canvas) {
	var prevMouse = null;
	var mouseState = [false, false];
	canvas.addEventListener("mousemove", function(evt) {
		evt.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var curMouse = [evt.clientX - rect.left, evt.clientY - rect.top];
		if (!prevMouse) {
			prevMouse = [evt.clientX - rect.left, evt.clientY - rect.top];
		} else {
			if (evt.buttons == 1) {
				camera.rotate(prevMouse, curMouse);
			} else if (evt.buttons == 2) {
				camera.pan([curMouse[0] - prevMouse[0], prevMouse[1] - curMouse[1]]);
			}
		}
		prevMouse = curMouse;
	});

	canvas.addEventListener("wheel", function(evt) {
		evt.preventDefault();
		camera.zoom(-evt.deltaY);
	});

	canvas.oncontextmenu = function (evt) {
		evt.preventDefault();
	};

	var touches = {};
	canvas.addEventListener("touchstart", function(evt) {
		var rect = canvas.getBoundingClientRect();
		evt.preventDefault();
		for (var i = 0; i < evt.changedTouches.length; ++i) {
			var t = evt.changedTouches[i];
			touches[t.identifier] = [t.clientX - rect.left, t.clientY - rect.top];
		}
	});

	canvas.addEventListener("touchmove", function(evt) {
		evt.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var numTouches = Object.keys(touches).length;
		// Single finger to rotate the camera
		if (numTouches == 1) {
			var t = evt.changedTouches[0];
			var prevTouch = touches[t.identifier];
			camera.rotate(prevTouch, [t.clientX - rect.left, t.clientY - rect.top]);
		} else {
			var curTouches = {};
			for (var i = 0; i < evt.changedTouches.length; ++i) {
				var t = evt.changedTouches[i];
				curTouches[t.identifier] = [t.clientX - rect.left, t.clientY - rect.top];
			}

			// If some touches didn't change make sure we have them in
			// our curTouches list to compute the pinch distance
			// Also get the old touch points to compute the distance here
			var oldTouches = [];
			for (t in touches) {
				if (!(t in curTouches)) {
					curTouches[t] = touches[t];
				}
				oldTouches.push(touches[t]);
			}

			var newTouches = [];
			for (t in curTouches) {
				newTouches.push(curTouches[t]);
			}

			// Determine if the user is pinching or panning
			var motionVectors = [
				vec2.set(vec2.create(), newTouches[0][0] - oldTouches[0][0],
					newTouches[0][1] - oldTouches[0][1]),
				vec2.set(vec2.create(), newTouches[1][0] - oldTouches[1][0],
					newTouches[1][1] - oldTouches[1][1])
			];
			var motionDirs = [vec2.create(), vec2.create()];
			vec2.normalize(motionDirs[0], motionVectors[0]);
			vec2.normalize(motionDirs[1], motionVectors[1]);
			
			var pinchAxis = vec2.set(vec2.create(), oldTouches[1][0] - oldTouches[0][0],
				oldTouches[1][1] - oldTouches[0][1]);
			vec2.normalize(pinchAxis, pinchAxis);

			var panAxis = vec2.lerp(vec2.create(), motionVectors[0], motionVectors[1], 0.5);
			vec2.normalize(panAxis, panAxis);

			var pinchMotion = [
				vec2.dot(pinchAxis, motionDirs[0]),
				vec2.dot(pinchAxis, motionDirs[1])
			];
			var panMotion = [
				vec2.dot(panAxis, motionDirs[0]),
				vec2.dot(panAxis, motionDirs[1])
			];

			// If we're primarily moving along the pinching axis and in the opposite direction with
			// the fingers, then the user is zooming.
			// Otherwise, if the fingers are moving along the same direction they're panning
			if (Math.abs(pinchMotion[0]) > 0.5 && Math.abs(pinchMotion[1]) > 0.5
				&& Math.sign(pinchMotion[0]) != Math.sign(pinchMotion[1]))
			{
				// Pinch distance change for zooming
				var oldDist = pointDist(oldTouches[0], oldTouches[1]);
				var newDist = pointDist(newTouches[0], newTouches[1]);
				camera.zoom(newDist - oldDist);
			} else if (Math.abs(panMotion[0]) > 0.5 && Math.abs(panMotion[1]) > 0.5
				&& Math.sign(panMotion[0]) == Math.sign(panMotion[1]))
			{
				// Pan by the average motion of the two fingers
				var panAmount = vec2.lerp(vec2.create(), motionVectors[0], motionVectors[1], 0.5);
				panAmount[1] = -panAmount[1];
				camera.pan(panAmount);
			}
		}

		// Update the existing list of touches with the current positions
		for (var i = 0; i < evt.changedTouches.length; ++i) {
			var t = evt.changedTouches[i];
			touches[t.identifier] = [t.clientX - rect.left, t.clientY - rect.top];
		}
	});

	var touchEnd = function(evt) {
		evt.preventDefault();
		for (var i = 0; i < evt.changedTouches.length; ++i) {
			var t = evt.changedTouches[i];
			delete touches[t.identifier];
		}
	}
	canvas.addEventListener("touchcancel", touchEnd);
	canvas.addEventListener("touchend", touchEnd);
}

var pointDist = function(a, b) {
	var v = [b[0] - a[0], b[1] - a[1]];
	return Math.sqrt(Math.pow(v[0], 2.0) + Math.pow(v[1], 2.0));
}

// Compile and link the shaders vert and frag. vert and frag should contain
// the shader source code for the vertex and fragment shaders respectively
// Returns the compiled and linked program, or null if compilation or linking failed
var compileShader = function(vert, frag){
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, vert);
	gl.compileShader(vs);
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)){
		alert("Vertex shader failed to compile, see console for log");
		console.log(gl.getShaderInfoLog(vs));
		return null;
	}

	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, frag);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
		alert("Fragment shader failed to compile, see console for log");
		console.log(gl.getShaderInfoLog(fs));
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
		alert("Shader failed to link, see console for log");
		console.log(gl.getProgramInfoLog(program));
		return null;
	}
	return program;
}

