#include <global/camera>
#include <local>

layout(location = 0) in vec4 a_position;
#if USE_ALBEDO_MAP
    layout(location = 1) in vec2 a_texCoord;
#endif
layout(location = 2) in vec3 a_normal;

#if USE_SKIN
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
        skin_transform(pos);
    #endif 
    pos = a_model * pos;

    v_position = pos.xyz;
    gl_Position = camera.projection * camera.view * pos;
}