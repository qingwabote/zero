#include <global>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 2) in vec2 a_texCoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texCoord;

    gl_Position = matProj * (matView * matWorld) * a_position;
}