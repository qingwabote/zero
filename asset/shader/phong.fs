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
    vec4 albedo = vec4(1.0, 1.0, 1.0, 1.0);

    #if USE_ALBEDO_MAP
        albedo *= texture(albedoMap, v_uv);
    #endif

    vec3 litColor = vec3(1.0, 1.0, 1.0);

    vec3 diffuse = max(dot(v_normal, litDir), 0.0) * litColor;

    float specularStrength = 0.5;
    vec3 viewDir = normalize(cameraPos - v_position);
    #if BLINN_PHONG
        vec3 halfwayDir = normalize(litDir + viewDir);
        vec3 specular = specularStrength * pow(max(dot(v_normal, halfwayDir), 0.0), 16.0) * litColor;
    #else
        vec3 reflectDir = reflect(-litDir, v_normal);
        vec3 specular = specularStrength * pow(max(dot(viewDir, reflectDir), 0.0), 8.0) * litColor;
    #endif

    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * litColor;

    v_color = albedo * vec4(diffuse + specular + ambient, 1.0);
}