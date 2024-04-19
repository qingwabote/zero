#include <local>

layout(set = 0, binding = 3) uniform Shadow {
    mat4 viewProj;
} shadow;

layout(location = 0) in vec3 a_position;

void main() {
    gl_Position = shadow.viewProj * local.model * vec4(a_position, 1);
}