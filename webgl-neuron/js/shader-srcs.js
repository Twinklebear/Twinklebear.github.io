var vertShader =
`#version 300 es
#line 4
layout(location=0) in vec3 pos;
uniform mat4 proj_view;
uniform vec3 eye_pos;
uniform vec3 volume_scale;

out vec3 vray_dir;
flat out vec3 transformed_eye;

void main(void) {
	// TODO: For non-uniform size volumes we need to transform them differently as well
	// to center them properly
	vec3 volume_translation = vec3(0.5) - volume_scale * 0.5;
	gl_Position = proj_view * vec4(pos * volume_scale + volume_translation, 1);
	transformed_eye = (eye_pos - volume_translation) / volume_scale;
	vray_dir = pos - transformed_eye;
}`;

var fragShader =
`#version 300 es
#line 24
precision highp int;
precision highp float;
uniform highp sampler3D volume;
uniform highp usampler3D ivolume;
uniform highp sampler2D colormap;
uniform highp sampler2D depth;
uniform vec2 value_range;
uniform ivec3 volume_dims;
uniform vec3 eye_pos;
uniform vec3 volume_scale;
uniform float dt_scale;
uniform mat4 inv_proj;
uniform mat4 inv_view;
uniform int highlight_trace;
uniform float threshold;
uniform int volume_is_int;
uniform ivec2 canvas_dims;

in vec3 vray_dir;
flat in vec3 transformed_eye;
out vec4 color;

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(0);
	const vec3 box_max = vec3(1);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

// Pseudo-random number gen from
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/
// with some tweaks for the range of values
float wang_hash(int seed) {
	seed = (seed ^ 61) ^ (seed >> 16);
	seed *= 9;
	seed = seed ^ (seed >> 4);
	seed *= 0x27d4eb2d;
	seed = seed ^ (seed >> 15);
	return float(seed % 2147483647) / float(2147483647);
}

// Linearize the depth value passed in
float linearize(float d) {
	float near = 0.0;
	float far = 1.0;
	return (2.f * d - near - far) / (far - near);
}

// Reconstruct the view-space position
vec4 compute_view_pos(float z) {
	// TODO: We don't really care about the full view position here
	vec4 pos = vec4(gl_FragCoord.xy / vec2(canvas_dims) * 2.f - 1.f, z, 1.f);
	pos = inv_proj * pos;
	return pos / pos.w;
}

void main(void) {
	vec3 ray_dir = normalize(vray_dir);
	vec2 t_hit = intersect_box(transformed_eye, ray_dir);
	if (t_hit.x > t_hit.y) {
		discard;
	}

	t_hit.x = max(t_hit.x, 0.0);

	float z = linearize(texelFetch(depth, ivec2(gl_FragCoord), 0).x);
	if (z < 1.0) {
		vec3 volume_translation = vec3(0.5) - volume_scale * 0.5;
		vec3 geom_pos = (inv_view * compute_view_pos(z)).xyz;
		geom_pos = (geom_pos - volume_translation) / volume_scale;
		t_hit.y = min(length(geom_pos - transformed_eye), t_hit.y);

		// Highlighting the trace just skips properly compositing it in the volume
		// to always show it on top
		if (highlight_trace != 0) {
			color = vec4(0);
			return;
		}
	}

	vec3 dt_vec = 1.0 / (vec3(volume_dims) * abs(ray_dir));
	float dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));
	float offset = wang_hash(int(gl_FragCoord.x + float(canvas_dims.x) * gl_FragCoord.y));
	vec3 p = transformed_eye + (t_hit.x + offset * dt) * ray_dir;
	for (float t = t_hit.x; t < t_hit.y; t += dt) {
		float val = 0.0;
		if (volume_is_int == 0) {
			val = texture(volume, p).r;
		} else {
			val = float(texture(ivolume, p).r);
		}
		val = (val - value_range.x) / (value_range.y - value_range.x);

		if (val >= threshold) {
			val = clamp((val - threshold) / (1.0 - threshold), 0.0, 1.0);
			vec4 val_color = vec4(texture(colormap, vec2(val, 0.5)).rgb, val);
			// Opacity correction
			val_color.a = 1.0 - pow(1.0 - val_color.a, dt_scale);
			color.rgb += (1.0 - color.a) * val_color.a * val_color.rgb;
			color.a += (1.0 - color.a) * val_color.a;
			if (color.a >= 0.95) {
				break;
			}
		}
		p += ray_dir * dt;
	}
}`;

var swcVertShader =
`#version 300 es
#line 127
layout(location=0) in vec3 pos;

uniform mat4 proj_view;
uniform vec3 volume_scale;
uniform ivec3 volume_dims;

void main(void) {
	vec3 volume_translation = vec3(0.5) - volume_scale * 0.5;
	gl_Position = proj_view * vec4((pos / vec3(volume_dims)) * volume_scale + volume_translation, 1);
}`;

var swcFragShader =
`#version 300 es
#line 141
precision highp float;

uniform vec3 swc_color;

out vec4 color;

void main(void) {
	color = vec4(swc_color, 1);
}`;

var quadVertShader =
`#version 300 es
#line 154
const vec4 pos[4] = vec4[4](
	vec4(-1, 1, 0.5, 1),
	vec4(-1, -1, 0.5, 1),
	vec4(1, 1, 0.5, 1),
	vec4(1, -1, 0.5, 1)
);
void main(void){
	gl_Position = pos[gl_VertexID];
}`;

var quadFragShader =
`#version 300 es
#line 167
precision highp int;
precision highp float;

uniform sampler2D colors;
out vec4 color;

void main(void){ 
	ivec2 uv = ivec2(gl_FragCoord.xy);
	color = texelFetch(colors, uv, 0);
}`;

