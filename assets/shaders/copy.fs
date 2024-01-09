precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = 0) uniform sampler2D colorMap;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = texture(colorMap, v_uv);
}