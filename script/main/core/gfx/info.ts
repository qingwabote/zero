export interface Vector<T> {
    size(): number;
    get(i: number): T;
    add(v: T): void;
}

export type StringVector = Vector<string>;

export type FloatVector = Vector<number>;

// copy values from VkShaderStageFlagBits in vulkan_core.h
export enum ShaderStageFlagBits {
    NONE = 0,
    VERTEX = 0x1,
    FRAGMENT = 0x10
}

export interface ShaderStage {
    type: ShaderStageFlagBits
    source: string
}

export interface ShaderInfo {
    readonly sources: StringVector;
    readonly types: FloatVector
}