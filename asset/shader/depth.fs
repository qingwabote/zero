precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 2, binding = 0) uniform sampler2D depthMap;

layout(location = 0) out vec4 v_color;

void main() {
    float depth = texture(depthMap, v_uv).r;
    // if (depth > 0.01) {
    //     v_color = vec4(0.0,0.0,0.0,1.0);
    // } else {
    //     v_color = vec4(1.0,1.0,1.0,1.0);
    // }
    v_color = vec4(0.0, 0.0, depth, 1.0); // orthographic
}