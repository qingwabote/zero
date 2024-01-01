#include <global/shadow>
#include <local>

layout(location = 0) in vec3 a_position;

void main() {
    gl_Position = shadow.projection * shadow.view * local.model * vec4(a_position, 1);
}