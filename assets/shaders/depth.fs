precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 2, binding = 0) uniform sampler2D albedoMap;

layout(location = 0) out vec4 fragColor;

void main() {
    float depth = texture(albedoMap, vec2(v_uv.x, 1.0 - v_uv.y)).r;
    fragColor = vec4(vec3(depth), 1.0); // orthographic
}