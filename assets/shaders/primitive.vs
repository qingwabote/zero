#include <global/camera>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 4) in vec4 a_color;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = camera.projection * camera.view * models[gl_InstanceIndex] * a_position;
}