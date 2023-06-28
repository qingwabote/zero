
// copy values from VkShaderStageFlagBits in vulkan_core.h
export enum ShaderStageFlagBits {
    VERTEX = 0x1,
    FRAGMENT = 0x10
}

export interface ShaderStage {
    readonly type: ShaderStageFlagBits
    readonly source: string
}

export interface ShaderInfo {
    readonly stages: Readonly<ShaderStage[]>;
}

export default interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): boolean;
}