import DescriptorSetLayout from "./gfx/DescriptorSetLayout.js";
import Shader from "./gfx/Shader.js";
import glsl, { Attribute, Uniform } from "./gfx/glsl.js";
import { DescriptorSetLayoutBinding, DescriptorType, ShaderStageFlagBits } from "./gfx/info.js";
import preprocessor from "./internal/preprocessor.js";

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

const _name2source: Record<string, { vs: string, fs: string }> = {};
const _name2macros: Record<string, Set<string>> = {};
const _key2shader: Record<string, Shader> = {};
const _shader2meta: WeakMap<Shader, Meta> = new WeakMap;
const _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

function genKey(name: string, macros: Record<string, number> = {}): string {
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
        const binding = new gfx.DescriptorSetLayoutBinding;
        binding.descriptorType = uniform.type;
        binding.stageFlags = uniform.stageFlags;
        binding.binding = uniform.binding;
        binding.descriptorCount = 1;
        return binding;
    },

    createDescriptorSetLayout(uniforms: UniformDefinition[]) {
        const info = new gfx.DescriptorSetLayoutInfo;
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
            const info = new gfx.DescriptorSetLayoutInfo;
            const samplerTextures = meta.samplerTextures;
            for (const name in samplerTextures) {
                const samplerTexture = samplerTextures[name];
                if (samplerTexture.set != set) {
                    continue;
                }
                const binding = new gfx.DescriptorSetLayoutBinding;
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
                const binding = new gfx.DescriptorSetLayoutBinding;
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

    async load(name: string, macros: Record<string, number> = {}): Promise<Shader> {
        let source = _name2source[name];
        if (!source) {
            const path = `../../assets/shaders/${name}`; // hard code

            let vs = await loader.load(`${path}.vs`, "text");
            vs = await preprocessor.includeExpand(vs);

            let fs = await loader.load(`${path}.fs`, "text");
            fs = await preprocessor.includeExpand(fs);

            _name2source[name] = { vs, fs };
            _name2macros[name] = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)])
        }

        const key = genKey(name, macros);
        if (!_key2shader[key]) {
            const mac: Record<string, number> = {};
            for (const macro of _name2macros[name]) {
                mac[macro] = macros[macro] || 0;
            }

            let { vs, fs } = _name2source[name];
            vs = preprocessor.macroExpand(mac, vs);
            fs = preprocessor.macroExpand(mac, fs);

            const shader = device.createShader();
            const info = new gfx.ShaderInfo;
            info.sources.add(vs)
            info.types.add(ShaderStageFlagBits.VERTEX);
            info.sources.add(fs)
            info.types.add(ShaderStageFlagBits.FRAGMENT);
            if (shader.initialize(info)) {
                throw new Error(`failed to initialize shader: ${name}`)
            }
            _key2shader[key] = shader;
            _shader2meta.set(shader, { key, ...glsl.parse([vs, fs], [ShaderStageFlagBits.VERTEX, ShaderStageFlagBits.FRAGMENT]) });
        }
        return _key2shader[key];
    },

    getMeta(shader: Shader): Meta {
        return _shader2meta.get(shader)!;
    }
} as const