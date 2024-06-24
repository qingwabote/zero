precision highp float;

#include <gamma>

#include <global/light>
#include <global/camera>

#if USE_ALBEDO_MAP
    layout(location = 0) in vec2 v_uv;
#endif

layout(location = 1) in vec3 v_normal;
layout(location = 2) in vec3 v_position;

#if USE_ALBEDO_MAP
    layout(set = 1, binding = 0) uniform sampler2D albedoMap;
#endif

#if USE_SHADOW_MAP
    #if SHADOW_MAP_CASCADED
        #define CSM_NUM 4
    #else
        #define CSM_NUM 1
    #endif
    layout(set = 0, binding = 3) uniform CSM {
        mat4 viewProj[CSM_NUM];
    } csm;
    layout(set = 0, binding = 0) uniform sampler2D shadowMap;
#endif

layout(set = 1, binding = 1) uniform Props  {
    vec4 albedo;
} props;

layout(location = 0) out vec4 fragColor;

#if USE_SHADOW_MAP
    #if SHADOW_MAP_CASCADED
        const vec4 CSMAtlas[4] = vec4[4](vec4(0.0,0.0,0.5,0.5),vec4(0.5,0.0,0.5,0.5),vec4(0.0,0.5,0.5,0.5),vec4(0.5,0.5,0.5,0.5));
    #else
        const vec4 CSMAtlas[1] = vec4[1](vec4(0.0,0.0,1.0,1.0));
    #endif
    
    float shadowFactor() {
        float factor = 0.0;

        #if SHADOW_MAP_PCF
            vec2 atlasSize = vec2(textureSize(shadowMap, 0));
        #endif

        for(int i = 0; i < CSM_NUM; i++) {
            vec4 position = csm.viewProj[i] * vec4(v_position, 1.0);

            #if CLIP_SPACE_MIN_Z_0
                vec3 pos = position.xyz * vec3(0.5, 0.5, 1.0) + vec3(0.5, 0.5, 0.0);
            #else
                vec3 pos = position.xyz * 0.5 + 0.5;
            #endif

            #if SHADOW_MAP_PCF
                float thresholdX = 1.0 / (atlasSize.x * CSMAtlas[i].z);
                float thresholdY = 1.0 / (atlasSize.y * CSMAtlas[i].w);
                if (pos.x < 0.0 + thresholdX || pos.x > 1.0 - thresholdX || pos.y < 0.0 + thresholdY || pos.y > 1.0 - thresholdY || pos.z < 0.0 || pos.z > 1.0) {
                    continue;
                }
            #else
                if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0 || pos.z < 0.0 || pos.z > 1.0) {
                    continue;
                }
            #endif

            pos.xy = CSMAtlas[i].xy + pos.xy * CSMAtlas[i].zw;

            #if SHADOW_MAP_PCF
                vec2 texelSize = 1.0 / atlasSize;
                for(int x = -1; x <= 1; ++x) {
                    for(int y = -1; y <= 1; ++y) {
                        factor += step(texture(shadowMap, pos.xy + vec2(x, y) * texelSize).r, pos.z);
                    }
                }
                factor /= 9.0;
            #else
                factor = step(texture(shadowMap, pos.xy).r, pos.z);
            #endif

            break;
        }
        
        return factor;
    }
#endif

void main() {
    vec4 albedo = props.albedo;

    #if USE_ALBEDO_MAP
        albedo *= SRGBToLinear(texture(albedoMap, v_uv));
    #endif

    vec3 litColor = vec3(1.0, 1.0, 1.0);

    vec3 diffuse = max(dot(v_normal, light.direction), 0.0) * litColor;

    float specularStrength = 0.5;
    vec3 viewDir = normalize(camera.position - v_position);
    vec3 halfwayDir = normalize(light.direction + viewDir);
    vec3 specular = specularStrength * pow(max(dot(v_normal, halfwayDir), 0.0), 16.0) * litColor;

    float ambientStrength = 0.3;
    vec3 ambient = ambientStrength * litColor;

    float shadow = 0.0;
    #if USE_SHADOW_MAP
        shadow = shadowFactor();
    #endif
    
    fragColor = LinearToSRGB(albedo * vec4(ambient + (diffuse + specular) * (1.0 - shadow), 1.0));
}