// copy values from VkBufferUsageFlagBits in vulkan_core.h
export enum BufferUsageFlagBits {
    INDEX = 0x4,
    VERTEX = 0x8,
    UNIFORM = 0x10,
}

export interface BufferInfo {
    readonly usage: BufferUsageFlagBits
    readonly size: number;
    readonly stride?: number;
    // readonly offset: number
}

export default interface Buffer {
    get info(): BufferInfo;
    initialize(info: BufferInfo): boolean;
    update(buffer: Readonly<BufferSource>): void;
}