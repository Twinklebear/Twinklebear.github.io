#version 450 core

layout(location = 0) in vec4 fcolor;

layout(location = 0) out vec4 color;

void main(void) {
    color = fcolor;
}

