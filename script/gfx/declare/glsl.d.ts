import { Format, ShaderStageFlagBits } from "./constants.js";

export declare interface Attribute {
    readonly location: number
    readonly format: Format
}

export declare interface UniformMember {
    readonly name: string
    readonly type: string
}

export declare interface Uniform {
    readonly set: number;
    readonly binding: number;
    readonly members?: readonly UniformMember[];
    readonly stageFlags: ShaderStageFlagBits;
}

export declare const glsl = {
    parse(sources: readonly string[], types: readonly ShaderStageFlagBits[]): {
        readonly attributes: Record<string, Attribute>;
        readonly blocks: Record<string, Uniform>;
        readonly samplerTextures: Record<string, Uniform>;
    }
}