#include <instance>

layout(location = 0) in vec4 a_position;

layout(set = 0, binding = 3) uniform CSMI {
    mat4 viewProj;
} csmi;

#if USE_SKIN
    #include <skin>
#endif

void main() {
    vec4 pos = a_position;
    #if USE_SKIN
        skin_transform(pos, uint(instances[gl_InstanceIndex].joint.x));
    #endif 

    gl_Position = csmi.viewProj * instances[gl_InstanceIndex].model * pos;
}