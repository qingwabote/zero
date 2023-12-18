// copy values from VkFormat in vulkan_core.h
export enum Format {
    UNDEFINED = 0,
    R8_UINT = 13,
    RGBA8_UNORM = 37,
    RGBA8_UINT = 41,
    RGBA8_SRGB = 43,
    R16_UINT = 74,
    RGBA16_UINT = 95,
    R32_UINT = 98,
    RG32_SFLOAT = 103,
    RGB32_SFLOAT = 106,
    RGBA32_UINT = 107,
    RGBA32_SFLOAT = 109,
}

interface FormatInfo {
    readonly name: string;
    readonly bytes: number
    readonly nums: number;
}

export const FormatInfos: Readonly<Record<Format, FormatInfo>> = {
    [Format.UNDEFINED]: { name: "UNDEFINED", bytes: 0, nums: 0 },
    [Format.R8_UINT]: { name: "R8_UINT", bytes: 1, nums: 1 },
    [Format.RGBA8_UNORM]: { name: "RGBA8_UNORM", bytes: 4, nums: 4 },
    [Format.RGBA8_UINT]: { name: "RGBA8_UINT", bytes: 4, nums: 4 },
    [Format.RGBA8_SRGB]: { name: "RGBA8_SRGB", bytes: 4, nums: 4 },
    [Format.R16_UINT]: { name: "R16_UINT", bytes: 2, nums: 1 },
    [Format.RGBA16_UINT]: { name: "RGBA16_UINT", bytes: 8, nums: 4 },
    [Format.R32_UINT]: { name: "R32_UINT", bytes: 4, nums: 1 },
    [Format.RG32_SFLOAT]: { name: "RG32_SFLOAT", bytes: 8, nums: 2 },
    [Format.RGB32_SFLOAT]: { name: "RGB32_SFLOAT", bytes: 12, nums: 3 },
    [Format.RGBA32_UINT]: { name: "RGBA32_UINT", bytes: 16, nums: 4 },
    [Format.RGBA32_SFLOAT]: { name: "RGBA32_SFLOAT", bytes: 16, nums: 4 },
}

// copy values from VkBufferUsageFlagBits in vulkan_core.h
export enum BufferUsageFlagBits {
    NONE = 0,
    TRANSFER_DST = 0x00000002,
    UNIFORM = 0x00000010,
    INDEX = 0x00000040,
    VERTEX = 0x00000080,
}

// copy values from VmaMemoryUsage in vk_men_alloc.h
export enum MemoryUsage {
    NONE = 0,
    GPU_ONLY = 1,
    CPU_TO_GPU = 3,
}

// copy values from VkShaderStageFlagBits in vulkan_core.h
export enum ShaderStageFlagBits {
    NONE = 0,
    VERTEX = 0x1,
    FRAGMENT = 0x10
}

// copy values from VkDescriptorType in vulkan_core.h
export enum DescriptorType {
    NONE = 0,
    SAMPLER_TEXTURE = 1,
    UNIFORM_BUFFER = 6,
    UNIFORM_BUFFER_DYNAMIC = 8,
}

// copy values from VkSampleCountFlagBits in vulkan_core.h
export enum SampleCountFlagBits {
    X1 = 0x00000001,
    X2 = 0x00000002,
    X4 = 0x00000004,
    X8 = 0x00000008
}

// copy values from VkImageUsageFlagBits in vulkan_core.h
export enum TextureUsageFlagBits {
    NONE = 0,
    TRANSFER_DST = 0x00000002,
    SAMPLED = 0x00000004,
    COLOR = 0x00000010,
    DEPTH_STENCIL = 0x00000020,
    TRANSIENT = 0x00000040,
}

// copy values from VkAttachmentLoadOp in vulkan_core.h
export enum LOAD_OP {
    LOAD = 0,
    CLEAR = 1,
}
// copy values from VkImageLayout in vulkan_core.h
export enum ImageLayout {
    UNDEFINED = 0,
    COLOR = 2,
    DEPTH_STENCIL = 3,
    DEPTH_STENCIL_READ_ONLY = 4,
    PRESENT_SRC = 1000001002,
}

// copy values from VkFilter in vulkan_core.h
export enum Filter {
    NEAREST = 0,
    LINEAR = 1
}
// copy values from VkSamplerAddressMode in vulkan_core.h
// export enum Address {
//     REPEAT = 0,
// }

// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}

//copy values from VkCullModeFlagBits in vulkan_core.h
export enum CullMode {
    NONE = 0,
    FRONT = 0x00000001,
    BACK = 0x00000002,
}

// copy values from VkBlendFactor in vulkan_core.h
export enum BlendFactor {
    ZERO = 0,
    ONE = 1,
    SRC_ALPHA = 6,
    ONE_MINUS_SRC_ALPHA = 7,
    DST_ALPHA = 8,
    ONE_MINUS_DST_ALPHA = 9,
    // SRC_COLOR,
    // DST_COLOR,
    // ONE_MINUS_SRC_COLOR,
    // ONE_MINUS_DST_COLOR,
    // SRC_ALPHA_SATURATE,
    // CONSTANT_COLOR,
    // ONE_MINUS_CONSTANT_COLOR,
    // CONSTANT_ALPHA,
    // ONE_MINUS_CONSTANT_ALPHA,
}

// copy values from VkPrimitiveTopology in vulkan_core.h
export enum PrimitiveTopology {
    LINE_LIST = 1,
    TRIANGLE_LIST = 3
}

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

// copy values from VkPipelineStageFlagBits in vulkan_core.h
export enum PipelineStageFlagBits {
    PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400
}

export enum ClearFlagBits {
    NONE = 0,
    COLOR = 0x1,
    DEPTH = 0x2
}