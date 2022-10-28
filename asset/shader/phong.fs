precision highp float;

#include <global>

layout(location = 0) in vec2 v_uv;
layout(location = 1) in vec3 v_normal;
layout(location = 2) in vec3 v_position;

#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif

layout(location = 0) out vec4 v_color;

void main() {
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);

    #if USE_ALBEDO_MAP
        baseColor *= texture(albedoMap, v_uv);
    #endif

    vec3 litColor = vec3(1.0, 1.0, 1.0);
    vec3 diffuse = litColor * max(dot(v_normal, litDir), 0.0);
    baseColor *= vec4(diffuse, 1.0);

    v_color = baseColor;
}