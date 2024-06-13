import { device } from "boot";
import { DescriptorSetLayoutBinding, DescriptorSetLayoutBindingVector, DescriptorSetLayoutInfo, DescriptorType, ShaderInfo, ShaderStageFlagBits, glsl } from "gfx";
import { preprocessor } from "./internal/preprocessor.js";
const attributes = {
    position: { name: 'a_position', location: 0 },
    uv: { name: 'a_texCoord', location: 1 },
    normal: { name: 'a_normal', location: 2 },
    joints: { name: 'a_joints', location: 3 },
    weights: { name: 'a_weights', location: 4 },
    color: { name: 'a_color', location: 4 },
    model: {
        name: 'a_model',
        /**5~8 */
        location: 5
    }
};
/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
    local: {
        index: 1,
        uniforms: {
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
};
const _key2shader = {};
const _shader2meta = new WeakMap;
const _shader2descriptorSetLayout = {};
const _macros = {
    CLIP_SPACE_MIN_Z_0: device.capabilities.clipSpaceMinZ == 0 ? 1 : 0
};
const descriptorSetLayout_empty = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);
export const shaderLib = {
    attributes,
    sets,
    descriptorSetLayout_empty,
    createDescriptorSetLayoutBinding(uniform) {
        const binding = new DescriptorSetLayoutBinding;
        binding.descriptorType = uniform.type;
        binding.stageFlags = uniform.stageFlags;
        binding.binding = uniform.binding;
        binding.descriptorCount = 1;
        return binding;
    },
    createDescriptorSetLayout(uniforms) {
        const info = new DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            info.bindings.add(this.createDescriptorSetLayoutBinding(uniform));
        }
        return device.createDescriptorSetLayout(info);
    },
    getDescriptorSetLayout(shader, set) {
        const meta = _shader2meta.get(shader);
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
        }
        ;
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
    getShader(asset, macros = {}) {
        var _a, _b, _c, _d;
        let shaderKey = asset.name;
        for (const key of asset.macros) {
            const val = (_b = (_a = macros[key]) !== null && _a !== void 0 ? _a : _macros[key]) !== null && _b !== void 0 ? _b : 0;
            shaderKey += val;
        }
        if (!_key2shader[shaderKey]) {
            const mac = {};
            for (const key of asset.macros) {
                mac[key] = (_d = (_c = macros[key]) !== null && _c !== void 0 ? _c : _macros[key]) !== null && _d !== void 0 ? _d : 0;
            }
            const sources = asset.sources.map(src => preprocessor.macroExpand(mac, src));
            const types = asset.types;
            const info = new ShaderInfo;
            for (let i = 0; i < sources.length; i++) {
                info.sources.add(sources[i]);
                info.types.add(types[i]);
            }
            const shader = device.createShader(info);
            if (!shader) {
                throw new Error(`failed to initialize shader: ${shaderKey}`);
            }
            _key2shader[shaderKey] = shader;
            _shader2meta.set(shader, Object.assign({ key: shaderKey }, glsl.parse(sources, types)));
        }
        return _key2shader[shaderKey];
    },
    getShaderMeta(shader) {
        return _shader2meta.get(shader);
    }
};
