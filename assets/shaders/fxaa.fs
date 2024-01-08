precision highp float;

#define LUMA_THRESHOLD_ABSOLUTE (1.0/12.0)
#define LUMA_THRESHOLD_RELATIVE (1.0/4.0)

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = 0) uniform sampler2D sceneColorMap;

layout(location = 0) out vec4 v_color;

void main() {
    ivec2 size = textureSize(sceneColorMap, 0);
    vec2 step = vec2(1.0 / float(size.x), 1.0 / float(size.y));

    vec3 rgbN = texture(sceneColorMap, v_uv + vec2(0, step.y)).rgb;
    vec3 rgbS = texture(sceneColorMap, v_uv + vec2(0, -step.y)).rgb;
    vec3 rgbW = texture(sceneColorMap, v_uv + vec2(-step.x, 0)).rgb;
    vec3 rgbE = texture(sceneColorMap, v_uv + vec2(step.x, 0)).rgb;

    vec4 rgbaM = texture(sceneColorMap, v_uv);
    vec3 rgbM = rgbaM.rgb;

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaN = dot(rgbN, luma);
    float lumaS = dot(rgbS, luma);
    float lumaW = dot(rgbW, luma);
    float lumaE = dot(rgbE, luma);
    float lumaM = dot(rgbM, luma);

    float lumaMin = min(lumaM, min(min(lumaN, lumaS), min(lumaW, lumaE)));
    float lumaMax = max(lumaM, max(max(lumaN, lumaS), max(lumaW, lumaE)));

    float contrast = lumaMax - lumaMin;
    if (contrast < max(LUMA_THRESHOLD_ABSOLUTE, lumaMax * LUMA_THRESHOLD_RELATIVE)) {
        v_color = rgbaM;
        return;
    }

    float lumaGradS = lumaS - lumaM;
    float lumaGradN = lumaN - lumaM;
    float lumaGradW = lumaW - lumaM;
    float lumaGradE = lumaE - lumaM;

    float lumaGradV = abs(lumaGradS + lumaGradN);
    float lumaGradH = abs(lumaGradW + lumaGradE);

    vec2 normal = vec2(0,0);
    if(lumaGradV > lumaGradH){
        normal.y = sign(abs(lumaGradN) - abs(lumaGradS));
    }else{
        normal.x = sign(abs(lumaGradE) - abs(lumaGradW));
    }

    float lumaL = (lumaN + lumaS + lumaE + lumaW) * 0.25;
    float lumaDeltaML = abs(lumaM - lumaL);
    float blend = lumaDeltaML / contrast;

    // v_color = vec4((normal + 1.0) * 0.5, 0.0, 1.0);

    v_color = texture(sceneColorMap, v_uv + normal * blend * step);

    // v_color = rgbaM;
}