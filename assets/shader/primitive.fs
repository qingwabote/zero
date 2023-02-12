precision highp float;

layout(location = 0) out vec4 v_color;

void main() {
    vec4 baseColor = vec4(0.5, 0.5, 0.5, 1.0);
    v_color = baseColor;
}