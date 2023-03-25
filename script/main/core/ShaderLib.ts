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
                binding: 1,
                members: {
                    joints: {},
                },
                length: 16 * 10,
                size: (16 * 10) * Float32Array.BYTES_PER_ELEMENT
            }
        }
    },
    material: {
        index: 2
    }
} as const

interface Uniform {
    type: DescriptorType,
    stageFlags: ShaderStageFlagBits,
    binding: number
}

function createDescriptorSetLayoutBinding(uniform: Uniform): DescriptorSetLayoutBinding {
    return {
        descriptorType: uniform.type,
        stageFlags: uniform.stageFlags,
        binding: uniform.binding,
        descriptorCount: 1,
    }
}

export default class ShaderLib {

    static readonly sets = sets;

    static readonly createDescriptorSetLayoutBinding = createDescriptorSetLayoutBinding;

    private static _key2localDescriptorSetLayout: Record<string, DescriptorSetLayout> = {};

    static getLocalDescriptorSetLayout(...uniforms: Uniform[]) {
        uniforms.sort((a, b) => a.binding - b.binding);
        const key = uniforms.reduce((str, uniform) => str + uniform.binding, '');
        let layout = this._key2localDescriptorSetLayout[key];
        if (!layout) {
            const bindings = uniforms.map(uniform => createDescriptorSetLayoutBinding(uniform));
            layout = gfx.createDescriptorSetLayout();
            layout.initialize(bindings);
            this._key2localDescriptorSetLayout[key] = layout;
        }
        return layout;
    }

    static readonly preloaded: { name: string, macros?: Record<string, number> }[] = [];

    static readonly instance = new ShaderLib;

    private _name2source: Record<string, ShaderStage[]> = {};
    private _name2macros: Record<string, Set<string>> = {};
    private _key2shader: Record<string, Shader> = {};
    private _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

    async loadShader(name: string, macros: Record<string, number> = {}): Promise<Shader> {
        let source = this._name2source[name];
        if (!source) {
            const path = `../../assets/shader/${name}`; // hard code

            let vs = await loader.load(`${path}.vs`, "text");
            vs = await preprocessor.includeExpand(vs);

            let fs = await loader.load(`${path}.fs`, "text");
            fs = await preprocessor.includeExpand(fs);

            this._name2source[name] = [
                { type: ShaderStageFlagBits.VERTEX, source: vs },
                { type: ShaderStageFlagBits.FRAGMENT, source: fs },
            ];
            this._name2macros[name] = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)])
        }

        const key = this.getShaderKey(name, macros);
        if (!this._key2shader[key]) {
            const mac: Record<string, number> = {};
            for (const macro of this._name2macros[name]) {
                mac[macro] = macros[macro] || 0;
            }
            const res = await preprocessor.preprocess(this._name2source[name], mac);
            const shader = gfx.createShader();
            shader.initialize({
                name,
                stages: res.stages,
                meta: res.meta,
                hash: key
            });
            this._key2shader[key] = shader;
        }
        return this._key2shader[key];
    }

    getShader(name: string, macros: Record<string, number> = {}): Shader {
        return this._key2shader[this.getShaderKey(name, macros)];
    }

    getMaterialDescriptorSetLayout(shader: Shader): DescriptorSetLayout {
        const set = sets.material.index;

        const key = `${set}:${shader.info.hash}`;
        let descriptorSetLayout = this._shader2descriptorSetLayout[key];
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

            this._shader2descriptorSetLayout[key] = descriptorSetLayout;
        }

        return descriptorSetLayout;
    }

    private getShaderKey(name: string, macros: Record<string, number> = {}): string {
        let key = name;
        for (const macro of this._name2macros[name]) {
            const val = macros[macro] || 0;
            key += val
        }
        return key;
    }
}