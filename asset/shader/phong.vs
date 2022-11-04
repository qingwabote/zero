#include <global>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec3 a_normal;

layout(location = 0) out vec2 v_uv;
layout(location = 1) out vec3 v_normal;
layout(location = 2) out vec3 v_position;

void main() {
    v_uv = a_texCoord;
    v_normal = normalize((local.modelIT * vec4(a_normal, 0.0)).xyz);
    v_position = (local.model * a_position).xyz;

    gl_Position = camera.projection * camera.view * local.model * a_position;
}