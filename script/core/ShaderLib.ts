import DescriptorSetLayout, { DescriptorSetLayoutBinding, DescriptorType } from "./gfx/DescriptorSetLayout.js";
import Shader, { ShaderStage, ShaderStageFlagBits } from "./gfx/Shader.js";
import preprocessor from "./preprocessor.js";

/**
 * The pipeline layout can include entries that are not used by a particular pipeline, or that are dead-code eliminated from any of the shaders
 */
const sets = {
    global: {
        set: 0
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
                size: (16 + 16) * Float32Array.BYTES_PER_ELEMENT,
            }
        }
    },
    material: {
        set: 2
    }
} as const

function createDescriptorSetLayoutBinding(uniform: { type: DescriptorType, binding: number }) {
    return {
        binding: uniform.binding,
        descriptorType: uniform.type,
        descriptorCount: 1,
        stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT
    }
}

function buildDescriptorSetLayout(uniforms: Record<string, { type: DescriptorType, binding: number }>): DescriptorSetLayout {
    const bindings: DescriptorSetLayoutBinding[] = [];
    for (const name in uniforms) {
        bindings.push(createDescriptorSetLayoutBinding(uniforms[name]))
    }
    const descriptorSetLayout = gfx.createDescriptorSetLayout();
    descriptorSetLayout.initialize(bindings);
    return descriptorSetLayout;
}

export default class ShaderLib {

    static readonly sets = sets;

    static readonly builtinDescriptorSetLayouts = { local: buildDescriptorSetLayout(sets.local.uniforms) };

    static readonly createDescriptorSetLayoutBinding = createDescriptorSetLayoutBinding;

    static align(size: number) {
        const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }

    static preloadedShaders: { name: string, macros: Record<string, number> }[] = [];

    static readonly instance = new ShaderLib;

    private _name2source: Record<string, ShaderStage[]> = {};
    private _name2macros: Record<string, Set<string>> = {};
    private _key2shader: Record<string, Shader> = {};
    private _shader2descriptorSetLayout: Record<string, DescriptorSetLayout> = {};

    async loadShader(name: string, macros: Record<string, number> = {}): Promise<Shader> {
        let source = this._name2source[name];
        if (!source) {
            let vs = await loader.load(`../../asset/shader/${name}.vs`, "text");
            vs = await preprocessor.includeExpand(vs);

            let fs = await loader.load(`../../asset/shader/${name}.fs`, "text");
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

    getDescriptorSetLayout(shader: Shader): DescriptorSetLayout {
        let descriptorSetLayout = this._shader2descriptorSetLayout[shader.info.hash];
        if (!descriptorSetLayout) {
            const bindings: DescriptorSetLayoutBinding[] = [];
            const samplerTextures = shader.info.meta.samplerTextures;
            for (const name in samplerTextures) {
                if (samplerTextures[name].set < sets.material.set) {
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

            this._shader2descriptorSetLayout[shader.info.hash] = descriptorSetLayout;
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