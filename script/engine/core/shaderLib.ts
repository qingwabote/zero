import { device } from "boot";
import { DescriptorSetLayout, DescriptorSetLayoutBinding, DescriptorSetLayoutBindingVector, DescriptorSetLayoutInfo, DescriptorType, Shader, ShaderInfo, ShaderStageFlagBits, glsl } from "gfx";
import { Shader as ShaderAsset } from "../assets/Shader.js";
import { preprocessor } from "./internal/preprocessor.js";

const attributes = {
    position: { name: 'a_position', location: 0 },
    uv: { name: 'a_texCoord', location: 1 },
    normal: { name: 'a_normal', location: 2 },
    joints: { name: 'a_joints', location: 3 },
    weights: { name: 'a_weights', location: 4 },
    color: { name: 'a_color', location: 4 }, // a_weights and a_color both are vec4 and not exist in same shader, they can share the same location

    // instanced

    model: {
        name: 'a_model',
        /**5~8 */
        location: 5
    },
    skin: { name: 'a_skin', location: 9 }
} as const

/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
    material: {
        index: 1
    },
    batch: {
        index: 2,
        uniforms: {
            Skin: {
                type: DescriptorType.SAMPLER_TEXTURE,
                stageFlags: ShaderStageFlagBits.VERTEX,
                binding: 1
            }
        }
    }
} as const

interface Uniform {
    type: DescriptorType,
    stageFlags: ShaderStageFlagBits,
    binding: number
}

interface Meta {
    readonly key: string;
    readonly blocks: Record<string, glsl.Uniform>;
    readonly samplerTextures: Record<string, glsl.Uniform>;
}

const _key2shader: Record<string, Shader> = {};
const _shader2meta: WeakMap<Shader, Meta> = new WeakMap;
const _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

const _macros: Readonly<Record<string, number>> = {
    CLIP_SPACE_MIN_Z_0: device.capabilities.clipSpaceMinZ == 0 ? 1 : 0
};

export const shaderLib = {
    attributes,

    sets,

    createDescriptorSetLayout(uniforms: Uniform[]) {
        const info = new DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            const binding = new DescriptorSetLayoutBinding;
            binding.descriptorType = uniform.type;
            binding.stageFlags = uniform.stageFlags;
            binding.binding = uniform.binding;
            binding.descriptorCount = 1;
            info.bindings.add(binding);
        }
        return device.createDescriptorSetLayout(info);
    },

    getDescriptorSetLayout(meta: Meta, set: number): DescriptorSetLayout {
        const key = `${set}:${meta.key}`;
        if (key in _shader2descriptorSetLayout) {
            return _shader2descriptorSetLayout[key];
        }

        const bindings = new DescriptorSetLayoutBindingVector;
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
            bindings.add(binding);
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
            bindings.add(binding);
        }

        const info = new DescriptorSetLayoutInfo;
        info.bindings = bindings;
        return _shader2descriptorSetLayout[key] = device.createDescriptorSetLayout(info);
    },

    getShader(asset: ShaderAsset, macros: Record<string, number> = {}): Shader {

        let shaderKey = asset.name;
        for (const key of asset.macros) {
            const val = macros[key] ?? _macros[key] ?? 0;
            shaderKey += val
        }

        if (!_key2shader[shaderKey]) {
            const mac: Record<string, number> = {};
            for (const key of asset.macros) {
                mac[key] = macros[key] ?? _macros[key] ?? 0;
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
                throw new Error(`failed to initialize shader: ${shaderKey}`)
            }
            _key2shader[shaderKey] = shader;
            _shader2meta.set(shader, { key: shaderKey, ...glsl.parse(sources, types) });
        }
        return _key2shader[shaderKey];
    },

    getShaderMeta(shader: Shader): Meta {
        return _shader2meta.get(shader)!;
    }
} as const