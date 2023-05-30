import DescriptorSetLayout, { DescriptorSetLayoutBinding, DescriptorType } from "./gfx/DescriptorSetLayout.js";
import Shader, { ShaderStage, ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./internal/preprocessor.js";

function align(size: number) {
    const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
    return Math.ceil(size / alignment) * alignment;
}

/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
    global: {
        index: 0,
        uniforms: {
            Camera: {
                type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
                stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
                binding: 1,
                members: {
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
                size: align((16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT),
            }
        }
    },
    local: {
        index: 1,
        uniforms: {
            Local: {
                type: DescriptorType.UNIFORM_BUFFER,
                stageFlags: ShaderStageFlagBits.VERTEX,
                binding: 0,
                members: {
                    model: {},
                    modelIT: {}
                },
                length: 16 + 16,
                size: (16 + 16) * Float32Array.BYTES_PER_ELEMENT,
            },
            Skin: {
                type: DescriptorType.UNIFORM_BUFFER,
                stageFlags: ShaderStageFlagBits.VERTEX,
                binding: 1,
                members: {
                    joints: {},
                },
                length: 16 * 128,
                size: (16 * 128) * Float32Array.BYTES_PER_ELEMENT
            }
        }
    },
    material: {
        index: 2
    }
} as const

export interface UniformDefinition {
    type: DescriptorType,
    stageFlags: ShaderStageFlagBits,
    binding: number
}

export interface ShaderCreateInfo {
    name: string;
    macros?: Record<string, number>;
}

const _name2source: Record<string, ShaderStage[]> = {};
const _name2macros: Record<string, Set<string>> = {};
const _key2shader: Record<string, Shader> = {};
const _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

function getShaderKey(info: ShaderCreateInfo): string {
    const name = info.name;
    const macros = info.macros || {};
    let key = name;
    for (const macro of _name2macros[name]) {
        const val = macros[macro] || 0;
        key += val
    }
    return key;
}

export default {
    sets,

    createDescriptorSetLayoutBinding(uniform: UniformDefinition): DescriptorSetLayoutBinding {
        return {
            descriptorType: uniform.type,
            stageFlags: uniform.stageFlags,
            binding: uniform.binding,
            descriptorCount: 1,
        }
    },

    createDescriptorSetLayout(uniforms: UniformDefinition[]) {
        const bindings = uniforms.map(uniform => this.createDescriptorSetLayoutBinding(uniform));
        const layout = gfx.createDescriptorSetLayout();
        layout.initialize(bindings);
        return layout;
    },

    getMaterialDescriptorSetLayout(shader: Shader): DescriptorSetLayout {
        const set = sets.material.index;

        const key = `${set}:${shader.info.hash}`;
        let descriptorSetLayout = _shader2descriptorSetLayout[key];
        if (!descriptorSetLayout) {
            const bindings: DescriptorSetLayoutBinding[] = [];
            const samplerTextures = shader.info.meta.samplerTextures;
            for (const name in samplerTextures) {
                const samplerTexture = samplerTextures[name];
                if (samplerTexture.set != set) {
                    continue;
                }
                bindings.push({
                    binding: samplerTexture.binding,
                    descriptorType: DescriptorType.SAMPLER_TEXTURE,
                    descriptorCount: 1,
                    stageFlags: samplerTexture.stageFlags
                });
            };
            const blocks = shader.info.meta.blocks;
            for (const name in blocks) {
                const block = blocks[name];
                if (block.set != set) {
                    continue;
                }
                bindings.push({
                    binding: block.binding,
                    descriptorType: DescriptorType.UNIFORM_BUFFER,
                    descriptorCount: 1,
                    stageFlags: block.stageFlags
                });
            }
            descriptorSetLayout = gfx.createDescriptorSetLayout();
            descriptorSetLayout.initialize(bindings);

            _shader2descriptorSetLayout[key] = descriptorSetLayout;
        }

        return descriptorSetLayout;
    },

    // getShader(info: ShaderCreateInfo): Shader {
    //     return _key2shader[getShaderKey(info)];
    // },

    async loadShader(info: ShaderCreateInfo): Promise<Shader> {
        const name = info.name;
        const macros = info.macros || {};

        let source = _name2source[name];
        if (!source) {
            const path = `../../assets/shaders/${name}`; // hard code

            let vs = await loader.load(`${path}.vs`, "text");
            vs = await preprocessor.includeExpand(vs);

            let fs = await loader.load(`${path}.fs`, "text");
            fs = await preprocessor.includeExpand(fs);

            _name2source[name] = [
                { type: ShaderStageFlagBits.VERTEX, source: vs },
                { type: ShaderStageFlagBits.FRAGMENT, source: fs },
            ];
            _name2macros[name] = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)])
        }

        const key = getShaderKey(info);
        if (!_key2shader[key]) {
            const mac: Record<string, number> = {};
            for (const macro of _name2macros[name]) {
                mac[macro] = macros[macro] || 0;
            }
            const res = await preprocessor.preprocess(_name2source[name], mac);
            const shader = gfx.createShader();
            shader.initialize({
                name,
                stages: res.stages,
                meta: res.meta,
                hash: key
            });
            _key2shader[key] = shader;
        }
        return _key2shader[key];
    }
} as const