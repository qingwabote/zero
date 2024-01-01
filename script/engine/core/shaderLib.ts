import { device } from "boot";
import { Attribute, DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Shader, ShaderInfo, ShaderStageFlagBits, Uniform, glsl } from "gfx";
import { Shader as ShaderAsset } from "../assets/Shader.js";
import { preprocessor } from "./internal/preprocessor.js";

/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
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
        const layout = device.createDescriptorSetLayout(info);
        return layout;
    },

    getDescriptorSetLayout(shader: Shader, set: number): DescriptorSetLayout {
        const meta = _shader2meta.get(shader)!;
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
            descriptorSetLayout = device.createDescriptorSetLayout(info);
            _shader2descriptorSetLayout[key] = descriptorSetLayout;
        }

        return descriptorSetLayout;
    },

    getShader(asset: ShaderAsset, macros: Record<string, number> = {}): Shader {

        let key = asset.name;
        for (const macro of asset.macros) {
            const val = macros[macro] || 0;
            key += val
        }

        if (!_key2shader[key]) {
            const mac: Record<string, number> = {};
            for (const macro of asset.macros) {
                mac[macro] = macros[macro] || 0;
            }

            const sources = asset.sources.map(src => preprocessor.macroExpand(mac, src));
            const types = asset.types;

            const info = new ShaderInfo;
            for (let i = 0; i < sources.length; i++) {
                info.sources.add(sources[i])
                info.types.add(types[i]);
            }

            const shader = device.createShader(info);
            if (!shader) {
                throw new Error(`failed to initialize shader: ${key}`)
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