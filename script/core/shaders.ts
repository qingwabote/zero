import { DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorType } from "./gfx/Pipeline.js";
import Shader, { ShaderStage, ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

function align(size: number) {
    const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
    return Math.ceil(size / alignment) * alignment;
}

const FLOAT32_BYTES = 4;

const builtinUniformBlocks = {
    global: {
        set: 0,
        blocks: {
            Global: {
                binding: 0,
                uniforms: {
                    litDir: {}
                },
                size: 3 * FLOAT32_BYTES
            },
            Camera: {
                binding: 1,
                uniforms: {
                    matView: {},
                    matProj: {}
                },
                size: align((16 + 16) * FLOAT32_BYTES),
                dynamic: true
            }
        }
    },
    local: {
        set: 1,
        blocks: {
            Local: {
                binding: 0,
                uniforms: {
                    matWorld: {},
                    matWorldIT: {}
                },
                size: (16 + 16) * FLOAT32_BYTES,
            }
        }
    },
    material: {
        set: 2
    }
} as const

function buildDescriptorSetLayout(res: {
    set: number,
    blocks: Record<string, { binding: number, dynamic?: boolean }>
}): DescriptorSetLayout {
    const bindings: DescriptorSetLayoutBinding[] = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = {
            binding: block.binding,
            descriptorType: block.dynamic ? DescriptorType.UNIFORM_BUFFER_DYNAMIC : DescriptorType.UNIFORM_BUFFER,
            descriptorCount: 1,
            stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT
        }
    }
    const descriptorSetLayout = gfx.createDescriptorSetLayout();
    descriptorSetLayout.initialize(bindings);
    return descriptorSetLayout;
}

const name2source: Record<string, ShaderStage[]> = {};
const name2macros: Record<string, Set<string>> = {};

const shaders: Record<string, Shader> = {};

export default {
    builtinUniformBlocks,

    builtinDescriptorSetLayouts: {
        global: buildDescriptorSetLayout(builtinUniformBlocks.global),
        local: buildDescriptorSetLayout(builtinUniformBlocks.local)
    },

    async getShader(name: string, macros: Record<string, number> = {}): Promise<Shader> {
        let source = name2source[name];
        if (!source) {
            const vs = await zero.loader.load(`../../asset/shader/${name}.vs`, "text");
            const fs = await zero.loader.load(`../../asset/shader/${name}.fs`, "text");
            name2source[name] = [
                { type: ShaderStageFlagBits.VERTEX, source: vs },
                { type: ShaderStageFlagBits.FRAGMENT, source: fs },
            ];
            name2macros[name] = preprocessor.macrosExtract(fs);
        }

        let key = name;
        for (const macro of name2macros[name]) {
            key += macros[macro] || 0
        }

        if (!shaders[key]) {
            const res = await preprocessor.preprocess(name2source[name], macros);
            shaders[key] = gfx.createShader();
            shaders[key].initialize({
                name,
                stages: res.stages,
                meta: res.meta,
                hash: key
            });

        }
        return shaders[key];
    }
}