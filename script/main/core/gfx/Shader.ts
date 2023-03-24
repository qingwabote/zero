import { Format } from "./Pipeline.js";

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
    readonly format: Format
}

export interface UniformMember {
    readonly name: string
    readonly type: string
}

export interface Uniform {
    readonly set: number;
    readonly binding: number;
    readonly members?: readonly UniformMember[];
    readonly stageFlags: ShaderStageFlagBits;
}

export interface Meta {
    attributes: Record<string, Attribute>;
    samplerTextures: Record<string, Uniform>;
    blocks: Record<string, Uniform>;
}

export interface ShaderInfo {
    readonly name: string;
    readonly hash: string;
    readonly stages: Readonly<ShaderStage[]>;
    readonly meta: Meta;
}

export default interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): void;
}