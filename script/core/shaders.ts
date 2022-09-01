import gfx from "./gfx.js";
import { DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorType } from "./gfx/Pipeline.js";
import Shader, { ShaderStage, ShaderStageFlags } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

export const BuiltinUniformBlocks = {
    global: {
        set: 0,
        blocks: {
            Camera: {
                binding: 0,
                // uniforms: {
                //     matProj: {}
                // }
            }
        }
    },
    local: {
        set: 1,
        blocks: {
            Local: {
                binding: 0,
                // uniforms: {
                //     matWorld: {}
                // }
            }
        }
    }
}

function buildDescriptorSetLayout(res: {
    set: number,
    blocks: Record<string, { binding: number }>
}): DescriptorSetLayout {
    const bindings: DescriptorSetLayoutBinding[] = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = { binding: block.binding, descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 }
    }
    return { bindings }
}

export const BuiltinDescriptorSetLayouts = {
    global: buildDescriptorSetLayout(BuiltinUniformBlocks.global),
    local: buildDescriptorSetLayout(BuiltinUniformBlocks.local)
}

const chunks: string[] = [];
chunks.push("global");
chunks.push(`
layout(set = 0, binding = 0) uniform Camera {
    mat4 matView;
    mat4 matProj;
};
`);

chunks.push("local");
chunks.push(`
layout(set = 1, binding = 0) uniform Local {
    mat4 matWorld;
};
`);
const name2chunk: Record<string, string> = {};
while (chunks.length > 1) {
    const chunk = chunks.pop()!;
    const name = chunks.pop()!;
    name2chunk[name] = chunk;
}

const sources: string[] = [];

sources.push('triangle');
sources.push(`
#include <global>
#include <local>

layout(location = 0) in vec4 a_position;

void main() {
    gl_Position = matProj * (matView * matWorld) * a_position;
}
`);
sources.push(`
precision highp float;

out vec4 v_color;

void main() {
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);
    v_color = baseColor;
}
`)

sources.push('zero');
sources.push(`
#include <global>
#include <local>

layout(location = 0) in vec4 a_position;
layout(location = 2) in vec2 a_texCoord;

out vec2 v_uv;

void main() {
    v_uv = a_texCoord;

    gl_Position = matProj * (matView * matWorld) * a_position;
}
`);
sources.push(`
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

const name2source: Record<string, ShaderStage[]> = {};
const name2macros: Record<string, Set<string>> = {};
while (sources.length > 2) {
    const fs = sources.pop()!;
    const vs = sources.pop()!;
    const name = sources.pop()!;

    name2source[name] = [
        { type: ShaderStageFlags.VERTEX, source: vs },
        { type: ShaderStageFlags.FRAGMENT, source: fs },
    ];
    name2macros[name] = preprocessor.macrosExtract(fs);
}

const shaders: Record<string, Shader> = {};
export default {
    getShader(name: string, macros: Record<string, number> = {}): Shader {
        let key = name;
        for (const macro of name2macros[name]) {
            key += macros[macro] || 0
        }

        if (!shaders[key]) {
            const res = preprocessor.preprocess(name2chunk, name2source[name], macros);
            shaders[key] = gfx.device.createShader();
            shaders[key].initialize({
                name,
                stages: res.out,
                meta: res.meta
            });

        }
        return shaders[key];
    }
}