// copy values from VkBufferUsageFlagBits in vulkan_core.h
export var BufferUsageFlagBits;
(function (BufferUsageFlagBits) {
    BufferUsageFlagBits[BufferUsageFlagBits["TRANSFER_DST"] = 2] = "TRANSFER_DST";
    BufferUsageFlagBits[BufferUsageFlagBits["UNIFORM"] = 16] = "UNIFORM";
    BufferUsageFlagBits[BufferUsageFlagBits["INDEX"] = 64] = "INDEX";
    BufferUsageFlagBits[BufferUsageFlagBits["VERTEX"] = 128] = "VERTEX";
})(BufferUsageFlagBits || (BufferUsageFlagBits = {}));
// copy values from VmaMemoryUsage in vk_men_alloc.h
export var MemoryUsage;
(function (MemoryUsage) {
    MemoryUsage[MemoryUsage["GPU_ONLY"] = 1] = "GPU_ONLY";
    MemoryUsage[MemoryUsage["CPU_TO_GPU"] = 3] = "CPU_TO_GPU";
})(MemoryUsage || (MemoryUsage = {}));
export class EmptyBuffer {
    get info() {
        return { usage: 0, mem_usage: 0, size: 0 };
    }
    initialize(info) {
        return false;
    }
    update(buffer) {
    }
    destroy() {
    }
}
//# sourceMappingURL=Buffer.js.map