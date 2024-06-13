#include <local>

layout(set = 0, binding = 3) uniform CSMI {
    mat4 viewProj;
} csmi;

layout(location = 0) in vec3 a_position;

void main() {
    gl_Position = csmi.viewProj * a_model * vec4(a_position, 1);
}