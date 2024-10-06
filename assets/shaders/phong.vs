#include <global/camera>
#include <local>

layout(location = 0) in vec4 a_position;
#if USE_ALBEDO_MAP
    layout(location = 1) in vec2 a_texCoord;
#endif
layout(location = 2) in vec3 a_normal;
#if USE_SKIN
    layout(location = 3) in uvec4 a_joints;
    layout(location = 4) in vec4 a_weights;
    #include <skin>
#endif

#if USE_ALBEDO_MAP
    layout(location = 0) out vec2 v_uv;
#endif
layout(location = 1) out vec3 v_normal;
layout(location = 2) out vec3 v_position;

void main() {
    #if USE_ALBEDO_MAP
        v_uv = a_texCoord;
    #endif
    v_normal = normalize((a_model * vec4(a_normal, 0.0)).xyz);

    vec4 pos = a_position;
    #if USE_SKIN
        mat4 joint_matrix = 
            skin_jointMatrix(a_joints.x) * a_weights.x + 
            skin_jointMatrix(a_joints.y) * a_weights.y + 
            skin_jointMatrix(a_joints.z) * a_weights.z +
            skin_jointMatrix(a_joints.w) * a_weights.w;
        pos = joint_matrix * pos;
    #endif 
    vec4 posWorld = a_model * pos;
    v_position = posWorld.xyz;
    gl_Position = camera.projection * camera.view * posWorld;
}