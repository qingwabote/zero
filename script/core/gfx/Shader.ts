import { DescriptorSetLayout } from "./Pipeline.js";

export enum ShaderStageFlags {
    VERTEX = 0x1,
    FRAGMENT = 0x10,
    ALL = 0x3f
}

export interface ShaderStage {
    readonly type: ShaderStageFlags
    source: string
}

export interface Attribute {
    readonly location: number
}

export interface Uniform {
    set: number;
    binding: number;
}

export interface Meta {
    attributes: Record<string, Attribute>;
    samplerTextures: Record<string, Uniform>;
    blocks: Record<string, Uniform>;
    descriptorSetLayout: DescriptorSetLayout;
}

export interface ShaderInfo {
    readonly name: string;
    readonly stages: ShaderStage[];
    readonly meta: Meta;
}

export default interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): void;
}