precision highp float;

#include <gamma>

#include <global/light>
#include <global/camera>
#if USE_SHADOW_MAP
    #include <global/shadowMap>
#endif

#if USE_ALBEDO_MAP
    layout(location = 0) in vec2 v_uv;
#endif
layout(location = 1) in vec3 v_normal;
layout(location = 2) in vec3 v_position;
#if USE_SHADOW_MAP
    layout(location = 3) in vec4 v_shadow_position;
#endif
#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif

layout(set = 2, binding = 1) uniform Material  {
    vec4 albedo;
} material;

layout(location = 0) out vec4 v_color;

#if USE_SHADOW_MAP
    float shadowFactor(vec4 position) {
        #if CLIP_SPACE_MIN_Z_0
            vec3 pos = position.xyz * vec3(0.5, 0.5, 1.0) + vec3(0.5, 0.5, 0.0);
        #else
            vec3 pos = position.xyz * 0.5 + 0.5;
        #endif

        float factor = 0.0;
        #if SHADOW_MAP_PCF
            vec2 texelSize = 1.0 / vec2(textureSize(shadowMap, 0));
            for(int x = -1; x <= 1; ++x) {
                for(int y = -1; y <= 1; ++y) {
                    float depth = texture(shadowMap, pos.xy + vec2(x, y) * texelSize).r; 
                    factor += pos.z > depth ? 1.0 : 0.0;
                }
            }
            factor /= 9.0;
        #else
            float depth = texture(shadowMap, pos.xy).r;
            factor = pos.z > depth ? 1.0 : 0.0;
        #endif
        
        return factor;
    }
#endif

void main() {
    vec4 albedo = material.albedo;

    #if USE_ALBEDO_MAP
        albedo *= SRGBToLinear(texture(albedoMap, v_uv));
    #endif

    vec3 litColor = vec3(1.0, 1.0, 1.0);

    vec3 diffuse = max(dot(v_normal, light.direction), 0.0) * litColor;

    float specularStrength = 0.5;
    vec3 viewDir = normalize(camera.position - v_position);
    vec3 halfwayDir = normalize(light.direction + viewDir);
    vec3 specular = specularStrength * pow(max(dot(v_normal, halfwayDir), 0.0), 16.0) * litColor;

    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * litColor;

    float shadow = 0.0;
    #if USE_SHADOW_MAP
        shadow = shadowFactor(v_shadow_position);
    #endif
    
    v_color = LinearToSRGB(albedo * vec4(ambient + (diffuse + specular) * (1.0 - shadow), 1.0));
}