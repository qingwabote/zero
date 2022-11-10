#include <global>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texCoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texCoord;

    gl_Position = camera.projection * camera.view * local.model * a_position;
}