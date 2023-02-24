// copy values from VkBufferUsageFlagBits in vulkan_core.h
export enum BufferUsageFlagBits {
    TRANSFER_DST = 0x00000002,
    UNIFORM = 0x00000010,
    INDEX = 0x00000040,
    VERTEX = 0x00000080,
}

// copy values from VmaMemoryUsage in vk_men_alloc.h
export enum MemoryUsage {
    GPU_ONLY = 1,
    CPU_TO_GPU = 3,
}

export interface BufferInfo {
    readonly usage: BufferUsageFlagBits;
    readonly mem_usage: MemoryUsage;
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
}

export class EmptyBuffer implements Buffer {
    get info(): BufferInfo {
        return { usage: 0, mem_usage: 0, size: 0 };
    }
    initialize(info: BufferInfo): boolean {
        return false;
    }
    update(buffer: ArrayBufferView): void {
    }
}