precision highp float;

layout(location = 0) in vec2 v_uv;

#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif

layout(location = 0) out vec4 v_color;

void main() {
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);
    #if USE_ALBEDO_MAP
        baseColor *= texture(albedoMap, v_uv);
    #endif
    v_color = baseColor;
}