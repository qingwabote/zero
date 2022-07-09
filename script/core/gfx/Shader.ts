import { DescriptorSetLayout, DescriptorType } from "./Pipeline.js"

export enum ShaderStageFlags {
    VERTEX = 0x1,
    FRAGMENT = 0x10,
    ALL = 0x3f
}

export interface ShaderInfo {
    readonly name: string
    readonly stages: ShaderStage[]
}

export interface ShaderStage {
    readonly type: ShaderStageFlags
    readonly source: string
}

export interface Attribute {
    readonly location: number
}

export interface Uniform {
    set: number;
    binding: number;
}

export default abstract class Shader {
    protected _info!: ShaderInfo;
    get info(): ShaderInfo {
        return this._info;
    }

    protected _attributes: Record<string, Attribute> = {};
    get attributes(): Record<string, Attribute> {
        return this._attributes;
    }

    protected _descriptorSetLayout: DescriptorSetLayout = { bindings: [] };
    get descriptorSetLayout(): DescriptorSetLayout {
        return this._descriptorSetLayout;
    }

    protected _samplerTextures: Record<string, Uniform> = {};
    protected _blocks: Record<string, Uniform> = {};

    initialize(info: ShaderInfo): void {
        this._info = info;

        const vertexStage = info.stages.find(stage => stage.type == ShaderStageFlags.VERTEX)!;
        const matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*\w+\s*(\w+)/g)!;
        for (const match of matches) {
            this._attributes[match[2]] = { location: parseInt(match[1]) }
        }

        const compiled: ShaderStage[] = [];
        for (const stage of info.stages) {
            const src = stage.source.replace(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)/g, this.compileUniform.bind(this))
            compiled.push({ type: stage.type, source: src })
        }

        this.compileShader(compiled, this._blocks, this._samplerTextures);
    }

    protected compileUniform(content: string, set: string, binding: string, type: string, name: string): string {
        if (!type) {
            // this._descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 })
            this._blocks[name] = { set: parseInt(set), binding: parseInt(binding) };
        } else if (type == 'sampler2D') {
            this._descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.SAMPLER_TEXTURE, count: 1 });
            this._samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding) };
        }
        return content;
    }

    protected abstract compileShader(stages: ShaderStage[], blocks: Record<string, Uniform>, samplerTextures: Record<string, Uniform>): void;
}