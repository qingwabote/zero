precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 2, binding = 0) uniform sampler2D albedoMap;

layout(location = 0) out vec4 v_color;

void main() {
    float depth = texture(albedoMap, v_uv).r;
    // if (depth == 0.0) {
    //     v_color = vec4(0.0,0.0,0.0,1.0);
    // } else {
    //     v_color = vec4(1.0,1.0,1.0,1.0);
    // }
    v_color = vec4(vec3(depth), 1.0); // orthographic
}