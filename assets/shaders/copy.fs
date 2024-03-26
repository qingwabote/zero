precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = 0) uniform sampler2D colorMap;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = texture(colorMap, v_uv);
}