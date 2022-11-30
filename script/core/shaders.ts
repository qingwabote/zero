import { DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorType } from "./gfx/Pipeline.js";
import Shader, { ShaderStage, ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

function align(size: number) {
    const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
    return Math.ceil(size / alignment) * alignment;
}

const FLOAT32_BYTES = 4;

/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
    global: {
        set: 0,
        uniforms: {
            Light: {
                type: DescriptorType.UNIFORM_BUFFER,
                binding: 0,
                uniforms: {
                    direction: {}
                },
                size: 3 * FLOAT32_BYTES
            },
            Camera: {
                type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
                binding: 1,
                uniforms: {
                    view: {
                        offset: 0
                    },
                    projection: {
                        offset: 16
                    },
                    position: {
                        offset: 16 + 16
                    }
                },
                size: align((16 + 16 + 4) * FLOAT32_BYTES),
            },
            Shadow: {
                type: DescriptorType.UNIFORM_BUFFER,
                binding: 2,
                uniforms: {
                    view: {
                        offset: 0
                    },
                    projection: {
                        offset: 16
                    }
                },
                size: (16 + 16) * FLOAT32_BYTES,
            },
            shadowMap: {
                type: DescriptorType.SAMPLER_TEXTURE,
                binding: 3,
            }
        }
    },
    local: {
        set: 1,
        uniforms: {
            Local: {
                type: DescriptorType.UNIFORM_BUFFER,
                binding: 0,
                uniforms: {
                    model: {},
                    modelIT: {}
                },
                size: (16 + 16) * FLOAT32_BYTES,
            }
        }
    },
    material: {
        set: 2
    }
} as const

function buildDescriptorSetLayout(uniforms: Record<string, { type: DescriptorType, binding: number }>): DescriptorSetLayout {
    const bindings: DescriptorSetLayoutBinding[] = [];
    for (const name in uniforms) {
        const block = uniforms[name];
        bindings[block.binding] = {
            binding: block.binding,
            descriptorType: block.type,
            descriptorCount: 1,
            stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT
        }
    }
    const descriptorSetLayout = gfx.createDescriptorSetLayout();
    descriptorSetLayout.initialize(bindings);
    return descriptorSetLayout;
}

const builtinDescriptorSetLayouts = {
    local: buildDescriptorSetLayout(sets.local.uniforms)
} as const

const name2source: Record<string, ShaderStage[]> = {};
const name2macros: Record<string, Set<string>> = {};

const shaders: Record<string, Shader> = {};

const shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

export default {
    sets,

    buildDescriptorSetLayout,

    builtinDescriptorSetLayouts,

    async getShader(name: string, macros: Record<string, number> = {}): Promise<Shader> {
        let source = name2source[name];
        if (!source) {
            let vs = await zero.loader.load(`../../asset/shader/${name}.vs`, "text");
            vs = await preprocessor.includeExpand(vs);

            let fs = await zero.loader.load(`../../asset/shader/${name}.fs`, "text");
            fs = await preprocessor.includeExpand(fs);

            name2source[name] = [
                { type: ShaderStageFlagBits.VERTEX, source: vs },
                { type: ShaderStageFlagBits.FRAGMENT, source: fs },
            ];
            name2macros[name] = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)])
        }

        const mac: Record<string, number> = {};
        let key = name;
        for (const macro of name2macros[name]) {
            const val = macros[macro] || 0;
            mac[macro] = val;
            key += val
        }

        if (!shaders[key]) {
            const res = await preprocessor.preprocess(name2source[name], mac);
            shaders[key] = gfx.createShader();
            shaders[key].initialize({
                name,
                stages: res.stages,
                meta: res.meta,
                hash: key
            });

        }
        return shaders[key];
    },

    getDescriptorSetLayout(shader: Shader): DescriptorSetLayout {
        let descriptorSetLayout = shader2descriptorSetLayout[shader.info.hash];
        if (!descriptorSetLayout) {
            const bindings: DescriptorSetLayoutBinding[] = [];
            const samplerTextures = shader.info.meta.samplerTextures;
            for (const name in samplerTextures) {
                if ((sets.global.uniforms as any)[name]) {
                    continue;
                }
                bindings.push({
                    binding: samplerTextures[name].binding,
                    descriptorType: DescriptorType.SAMPLER_TEXTURE,
                    descriptorCount: 1,
                    stageFlags: ShaderStageFlagBits.FRAGMENT
                });
            };
            descriptorSetLayout = gfx.createDescriptorSetLayout();
            descriptorSetLayout.initialize(bindings);

            shader2descriptorSetLayout[shader.info.hash] = descriptorSetLayout;
        }

        return descriptorSetLayout;
    }
} as const;