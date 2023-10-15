import { device } from "boot";
import { Attribute, DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Shader, ShaderInfo, ShaderStageFlagBits, Uniform, glsl } from "gfx";
import { ShaderStages } from "../assets/ShaderStages.js";
import { preprocessor } from "./internal/preprocessor.js";

function align(size: number) {
    const alignment = device.capabilities.uniformBufferOffsetAlignment;
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
            },
            Light: {
                type: DescriptorType.UNIFORM_BUFFER,
                stageFlags: ShaderStageFlagBits.FRAGMENT,
                binding: 2,
                members: {
                    direction: {}
                },
                size: 3 * Float32Array.BYTES_PER_ELEMENT
            },
            Shadow: {
                type: DescriptorType.UNIFORM_BUFFER,
                stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
                binding: 3,
                members: {
                    view: {
                        offset: 0
                    },
                    projection: {
                        offset: 16
                    }
                },
                size: (16 + 16) * Float32Array.BYTES_PER_ELEMENT,
            },
            ShadowMap: {
                type: DescriptorType.SAMPLER_TEXTURE,
                stageFlags: ShaderStageFlagBits.FRAGMENT,
                binding: 0,
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

export interface Meta {
    readonly key: string;
    readonly attributes: Record<string, Attribute>;
    readonly blocks: Record<string, Uniform>;
    readonly samplerTextures: Record<string, Uniform>;
}

const _key2shader: Record<string, Shader> = {};
const _shader2meta: WeakMap<Shader, Meta> = new WeakMap;
const _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

export const shaderLib = {
    sets,

    createDescriptorSetLayoutBinding(uniform: UniformDefinition): DescriptorSetLayoutBinding {
        const binding = new DescriptorSetLayoutBinding;
        binding.descriptorType = uniform.type;
        binding.stageFlags = uniform.stageFlags;
        binding.binding = uniform.binding;
        binding.descriptorCount = 1;
        return binding;
    },

    createDescriptorSetLayout(uniforms: UniformDefinition[]) {
        const info = new DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            info.bindings.add(this.createDescriptorSetLayoutBinding(uniform));
        }
        const layout = device.createDescriptorSetLayout();
        layout.initialize(info);
        return layout;
    },

    getMaterialDescriptorSetLayout(shader: Shader): DescriptorSetLayout {
        const meta = _shader2meta.get(shader)!;
        const set = sets.material.index;
        const key = `${set}:${meta.key}`;
        let descriptorSetLayout = _shader2descriptorSetLayout[key];
        if (!descriptorSetLayout) {
            const info = new DescriptorSetLayoutInfo;
            const samplerTextures = meta.samplerTextures;
            for (const name in samplerTextures) {
                const samplerTexture = samplerTextures[name];
                if (samplerTexture.set != set) {
                    continue;
                }
                const binding = new DescriptorSetLayoutBinding;
                binding.binding = samplerTexture.binding;
                binding.descriptorType = DescriptorType.SAMPLER_TEXTURE;
                binding.descriptorCount = 1;
                binding.stageFlags = samplerTexture.stageFlags;
                info.bindings.add(binding);
            };
            const blocks = meta.blocks;
            for (const name in blocks) {
                const block = blocks[name];
                if (block.set != set) {
                    continue;
                }
                const binding = new DescriptorSetLayoutBinding;
                binding.binding = block.binding;
                binding.descriptorType = DescriptorType.UNIFORM_BUFFER;
                binding.descriptorCount = 1;
                binding.stageFlags = block.stageFlags;
                info.bindings.add(binding);
            }
            descriptorSetLayout = device.createDescriptorSetLayout();
            descriptorSetLayout.initialize(info);

            _shader2descriptorSetLayout[key] = descriptorSetLayout;
        }

        return descriptorSetLayout;
    },

    getShader(stages: ShaderStages, macros: Record<string, number> = {}): Shader {

        let key = stages.name;
        for (const macro of stages.macros) {
            const val = macros[macro] || 0;
            key += val
        }

        if (!_key2shader[key]) {
            const mac: Record<string, number> = {};
            for (const macro of stages.macros) {
                mac[macro] = macros[macro] || 0;
            }

            const sources = stages.sources.map(src => preprocessor.macroExpand(mac, src));
            const types = stages.types;

            const info = new ShaderInfo;
            for (let i = 0; i < sources.length; i++) {
                info.sources.add(sources[i])
                info.types.add(types[i]);
            }

            const shader = device.createShader();
            if (shader.initialize(info)) {
                throw new Error(`failed to initialize shader: ${name}`)
            }
            _key2shader[key] = shader;
            _shader2meta.set(shader, { key, ...glsl.parse(sources, types) });
        }
        return _key2shader[key];
    },

    getShaderMeta(shader: Shader): Meta {
        return _shader2meta.get(shader)!;
    }
} as const