#include <global>
#include <local>

layout(location = 0) in vec3 a_position;
#if USE_ALBEDO_MAP
    layout(location = 1) in vec2 a_texCoord;
#endif
layout(location = 2) in vec3 a_normal;

#if USE_ALBEDO_MAP
    layout(location = 0) out vec2 v_uv;
#endif
layout(location = 1) out vec3 v_normal;
layout(location = 2) out vec3 v_position;
#if USE_SHADOW_MAP
    layout(location = 3) out vec4 v_shadow_position;
#endif

void main() {
    #if USE_ALBEDO_MAP
        v_uv = a_texCoord;
    #endif
    v_normal = normalize((local.modelIT * vec4(a_normal, 0.0)).xyz);

    vec4 pos = vec4(a_position, 1);
    vec4 posWorld = local.model * pos;
    v_position = posWorld.xyz;
    #if USE_SHADOW_MAP
        v_shadow_position = shadow.projection * shadow.view * posWorld;
    #endif
    gl_Position = camera.projection * camera.view * posWorld;
}