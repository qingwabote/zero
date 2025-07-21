#include <global/camera>
#include <instance>

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texcoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texcoord;

    gl_Position = camera.projection * camera.view * instances[gl_InstanceIndex].model * a_position;
}