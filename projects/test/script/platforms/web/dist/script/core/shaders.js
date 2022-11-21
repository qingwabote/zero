import { DescriptorType } from "./gfx/Pipeline.js";
import { ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";
function align(size) {
    const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
    return Math.ceil(size / alignment) * alignment;
}
const FLOAT32_BYTES = 4;
/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const builtinUniforms = {
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
                dynamic: true
            },
            Shadow: {
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
            }
        },
        samplers: {
            shadowMap: {
                binding: 3,
            }
        }
    },
    local: {
        set: 1,
        blocks: {
            Local: {
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
};
function buildDescriptorSetLayout(res) {
    const bindings = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = {
            binding: block.binding,
            descriptorType: block.dynamic ? DescriptorType.UNIFORM_BUFFER_DYNAMIC : DescriptorType.UNIFORM_BUFFER,
            descriptorCount: 1,
            stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT
        };
    }
    for (const name in res.samplers) {
        const sampler = res.samplers[name];
        bindings[sampler.binding] = {
            binding: sampler.binding,
            descriptorType: DescriptorType.SAMPLER_TEXTURE,
            descriptorCount: 1,
            stageFlags: ShaderStageFlagBits.FRAGMENT
        };
    }
    const descriptorSetLayout = gfx.createDescriptorSetLayout();
    descriptorSetLayout.initialize(bindings);
    return descriptorSetLayout;
}
const builtinDescriptorSetLayouts = {
    global: buildDescriptorSetLayout(builtinUniforms.global),
    local: buildDescriptorSetLayout(builtinUniforms.local)
};
const builtinGlobalPipelineLayout = gfx.createPipelineLayout();
builtinGlobalPipelineLayout.initialize([builtinDescriptorSetLayouts.global]);
const name2source = {};
const name2macros = {};
const shaders = {};
const shader2descriptorSetLayout = {};
export default {
    builtinUniforms,
    builtinDescriptorSetLayouts,
    builtinGlobalPipelineLayout,
    async getShader(name, macros = {}) {
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
            key += macros[macro] || 0;
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
    },
    getDescriptorSetLayout(shader) {
        let descriptorSetLayout = shader2descriptorSetLayout[shader.info.hash];
        if (!descriptorSetLayout) {
            const global_samplers = builtinUniforms.global.samplers;
            const bindings = [];
            const samplerTextures = shader.info.meta.samplerTextures;
            for (const name in samplerTextures) {
                if (global_samplers[name]) {
                    continue;
                }
                bindings.push({
                    binding: samplerTextures[name].binding,
                    descriptorType: DescriptorType.SAMPLER_TEXTURE,
                    descriptorCount: 1,
                    stageFlags: ShaderStageFlagBits.FRAGMENT
                });
            }
            ;
            descriptorSetLayout = gfx.createDescriptorSetLayout();
            descriptorSetLayout.initialize(bindings);
            shader2descriptorSetLayout[shader.info.hash] = descriptorSetLayout;
        }
        return descriptorSetLayout;
    }
};
//# sourceMappingURL=shaders.js.map