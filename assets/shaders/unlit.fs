precision highp float;

layout(location = 0) in vec2 v_uv;

#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif

layout(set = 2, binding = 1) uniform Constants  {
    vec4 albedo;
} constants;

layout(location = 0) out vec4 v_color;

void main() {
    vec4 albedo = constants.albedo;
    #if USE_ALBEDO_MAP
        albedo *= texture(albedoMap, v_uv);
    #endif
    v_color = albedo;
}