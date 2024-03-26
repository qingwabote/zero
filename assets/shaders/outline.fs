precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = 0) uniform sampler2D colorMap;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 color = texture(colorMap, v_uv);
    if(color.a > 0.5) {
        fragColor = color;
        return;
    }

    ivec2 size = textureSize(colorMap, 0);
    vec2 step = vec2(1.0 / float(size.x), 1.0 / float(size.y));

    float n = texture(colorMap, v_uv + vec2(0, step.y)).a;
    float s = texture(colorMap, v_uv + vec2(0, -step.y)).a;
    float w = texture(colorMap, v_uv + vec2(-step.x, 0)).a;
    float e = texture(colorMap, v_uv + vec2(step.x, 0)).a;

    float average = (n + s + w + e) / 4.0;
    if (average == 0.0) {
        fragColor = color;
        return;
    }

    fragColor = vec4(1.0, 0.0, 0.0 ,1.0);
}