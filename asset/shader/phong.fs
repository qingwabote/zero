precision highp float;

#include <global>

layout(location = 0) in vec2 v_uv;
layout(location = 1) in vec3 v_normal;
layout(location = 2) in vec3 v_position;
layout(location = 3) in vec4 v_shadow_position;

#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif

layout(location = 0) out vec4 v_color;

float shadowFactor(vec4 position) {
    #if CLIP_SPACE_MIN_Z_0
        vec3 pos = position.xyz * vec3(0.5, 0.5, 1.0) + vec3(0.5, 0.5, 0.0);
    #else
        vec3 pos = position.xyz * 0.5 + 0.5;
    #endif
    float depth = texture(shadowMap, pos.xy).r;
    return pos.z > depth ? 1.0 : 0.0;
}

void main() {
    vec4 albedo = vec4(1.0, 1.0, 1.0, 1.0);

    #if USE_ALBEDO_MAP
        albedo *= texture(albedoMap, v_uv);
    #endif

    vec3 litColor = vec3(1.0, 1.0, 1.0);

    vec3 diffuse = max(dot(v_normal, global.litDir), 0.0) * litColor;

    float specularStrength = 0.5;
    vec3 viewDir = normalize(camera.position - v_position);
    #if USE_BLINN_PHONG
        vec3 halfwayDir = normalize(global.litDir + viewDir);
        vec3 specular = specularStrength * pow(max(dot(v_normal, halfwayDir), 0.0), 16.0) * litColor;
    #else
        vec3 reflectDir = reflect(-global.litDir, v_normal);
        vec3 specular = specularStrength * pow(max(dot(viewDir, reflectDir), 0.0), 8.0) * litColor;
    #endif

    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * litColor;

    v_color = albedo * vec4(ambient + (diffuse + specular) * (1.0 - shadowFactor(v_shadow_position)), 1.0);

    // vec3 pos = v_shadow_position.xyz * 0.5 + 0.5;
    // v_color = vec4(0.0,0.0,pos.z,1.0);
    // if (shadowFactor(v_shadow_position) == 1.0) {
    //     v_color = vec4(0.0,0.0,0.0,1.0);
    // } else {
    //     v_color = vec4(1.0,1.0,1.0,1.0);
    // }
}