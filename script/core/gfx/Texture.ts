import { SampleCountFlagBits } from "./Pipeline.js";

// copy values from VkImageUsageFlagBits in vulkan_core.h
export enum TextureUsageBit {
    TRANSFER_DST = 0x00000002,
    SAMPLED = 0x00000004,
    COLOR_ATTACHMENT = 0x00000010,
    DEPTH_STENCIL_ATTACHMENT = 0x00000020
}

export interface TextureInfo {
    samples: SampleCountFlagBits;
    usage: TextureUsageBit;
    width: number;
    height: number;
}

export default interface Texture {
    get info(): TextureInfo;
    initialize(info: TextureInfo): boolean;
}