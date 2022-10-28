#include <global>
#include <local>

layout(location = 0) in vec4 a_position;

void main() {
    gl_Position = matProj * (matView * matWorld) * a_position;
}