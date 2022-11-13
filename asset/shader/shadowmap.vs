#include <local>

layout(location = 0) in vec3 a_position;

layout(set = 0, binding = 0) uniform Light {
    mat4 view;
    mat4 projection;
} light;

void main() {
    gl_Position = light.projection * light.view * local.model * vec4(a_position, 1);
}