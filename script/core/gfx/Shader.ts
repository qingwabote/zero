import { DescriptorSetLayout } from "./Pipeline.js";

// copy values from VkShaderStageFlagBits in vulkan_core.h
export enum ShaderStageFlagBits {
    VERTEX = 0x1,
    FRAGMENT = 0x10
}

export interface ShaderStage {
    type: ShaderStageFlagBits
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