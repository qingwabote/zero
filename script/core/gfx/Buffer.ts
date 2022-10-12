// copy values from VkBufferUsageFlagBits in vulkan_core.h
export enum BufferUsageFlagBits {
    INDEX = 0x40,
    VERTEX = 0x80,
    UNIFORM = 0x10,
}

export interface BufferInfo {
    readonly usage: BufferUsageFlagBits
    readonly size: number;
    /**
     * When byteStride of the referenced bufferView is not defined, 
     * it means that accessor elements are tightly packed, 
     * i.e., effective stride equals the size of the element.
     * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#data-alignment
     */
    readonly stride?: number;
    // readonly offset: number
}

export default interface Buffer {
    get info(): BufferInfo;
    initialize(info: BufferInfo): boolean;
    update(buffer: ArrayBufferView): void;
    destroy(): void;
}