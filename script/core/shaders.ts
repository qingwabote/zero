import gfx from "./gfx.js";
import { DescriptorSetLayout } from "./gfx/Pipeline.js";
import Shader from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

const buildinSource: string[] = [];

buildinSource.push('zero');
buildinSource.push(`
layout(location = 0) in vec4 a_position;
layout(location = 2) in vec2 a_texCoord;

out vec2 v_uv;

layout(set = 0, binding = 0) uniform Camera {
    mat4 matView;
    mat4 matProj;
};

layout(set = 1, binding = 0) uniform Local {
    mat4 matWorld;
};

void main() {
    v_uv = a_texCoord;

    gl_Position = matProj * (matView * matWorld) * a_position;
}
`);
buildinSource.push(`
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_uv;

#if USE_ALBEDO_MAP
    layout(set = 2, binding = 0) uniform sampler2D albedoMap;
#endif


out vec4 v_color;

void main() {
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);
    #if USE_ALBEDO_MAP
        baseColor *= texture(albedoMap, v_uv);
    #endif
    v_color = baseColor;
}
`)

export enum ShaderStageFlags {
    VERTEX = 0x1,
    FRAGMENT = 0x10,
    ALL = 0x3f
}

export interface ShaderStage {
    readonly type: ShaderStageFlags
    source: string
}

const name2source: Record<string, ShaderStage[]> = {};

export interface Attribute {
    readonly location: number
}

export interface Uniform {
    set: number;
    binding: number;
}

const name2macros: Record<string, Set<string>> = {};

export interface Meta {
    attributes: Record<string, Attribute>;
    samplerTextures: Record<string, Uniform>;
    blocks: Record<string, Uniform>;
    descriptorSetLayout: DescriptorSetLayout;
}

while (buildinSource.length > 2) {
    const fs = buildinSource.pop()!;
    const vs = buildinSource.pop()!;
    const name = buildinSource.pop()!;

    name2source[name] = [
        { type: ShaderStageFlags.VERTEX, source: vs },
        { type: ShaderStageFlags.FRAGMENT, source: fs },
    ];
    name2macros[name] = preprocessor.macrosExtract(fs, '');
}

const shaders: Record<string, Shader> = {};

export default {
    getShader(name: string, macros: Record<string, number>): Shader {
        let key = name;
        for (const macro of name2macros[name]) {
            key += macros[macro] || 0
        }

        if (!shaders[key]) {
            const res = preprocessor.preprocess(name2source[name], '', macros);
            shaders[key] = gfx.device.createShader({
                name,
                stages: res.out,
                meta: res.meta
            });

        }
        return shaders[key];
    }
}