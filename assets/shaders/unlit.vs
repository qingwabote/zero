#include <global/camera>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texcoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texcoord;

    gl_Position = camera.projection * camera.view * a_model * a_position;
}