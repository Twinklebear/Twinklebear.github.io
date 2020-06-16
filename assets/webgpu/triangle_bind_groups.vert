#version 450 core

layout(location = 0) in vec4 pos;
layout(location = 1) in vec4 vcolor;

layout(location = 0) out vec4 fcolor;

layout(binding = 0, std140) uniform ViewParams {
    mat4 view_proj;
};

void main(void) {
    fcolor = vcolor;
    gl_Position = view_proj * pos;
}

