import { DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorType } from "./gfx/Pipeline.js";
import Shader, { ShaderStage, ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

interface BuiltinDescriptorSetLayouts {
    global: DescriptorSetLayout,
    local: DescriptorSetLayout
}

const FLOAT32_BYTES = 4;

export const BuiltinUniformBlocks = {
    global: {
        set: 0,
        blocks: {
            Camera: {
                binding: 0,
                uniforms: {
                    matView: {
                    },
                    matProj: {
                    }
                },
                size: (16 + 16) * FLOAT32_BYTES,
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
                    matWorld: {
                    }
                }
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
            stageFlags: ShaderStageFlagBits.VERTEX
        }
    }
    const descriptorSetLayout = zero.gfx.createDescriptorSetLayout();
    descriptorSetLayout.initialize(bindings);
    return descriptorSetLayout;
}

let _builtinDescriptorSetLayouts: BuiltinDescriptorSetLayouts;

const name2source: Record<string, ShaderStage[]> = {};
const name2macros: Record<string, Set<string>> = {};

const shaders: Record<string, Shader> = {};

export default {
    get builtinDescriptorSetLayouts(): BuiltinDescriptorSetLayouts {
        if (!_builtinDescriptorSetLayouts) {
            _builtinDescriptorSetLayouts = {
                global: buildDescriptorSetLayout(BuiltinUniformBlocks.global),
                local: buildDescriptorSetLayout(BuiltinUniformBlocks.local)
            }
        }
        return _builtinDescriptorSetLayouts;
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
            shaders[key] = zero.gfx.createShader();
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