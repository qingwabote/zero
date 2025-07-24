// copy values from VkFormat in vulkan_core.h
export enum Format {
    UNDEFINED = 0,
    R8_UINT = 13,
    RGBA8_UNORM = 37,
    RGBA8_UINT = 41,
    RGBA8_SRGB = 43,
    BGRA8_UNORM = 44,
    R16_UINT = 74,
    RGBA16_UINT = 95,
    R32_UINT = 98,
    RG32_SFLOAT = 103,
    RGB32_SFLOAT = 106,
    RGBA32_UINT = 107,
    RGBA32_SFLOAT = 109,
    D32_SFLOAT = 126,
}

interface FormatInfo {
    readonly name: string;
    readonly bytes: number
    readonly elements: number;
}

export const FormatInfos: Readonly<Record<Format, FormatInfo>> = {
    [Format.UNDEFINED]: { name: "UNDEFINED", bytes: 0, elements: 0 },
    [Format.R8_UINT]: { name: "R8_UINT", bytes: 1, elements: 1 },
    [Format.RGBA8_UNORM]: { name: "RGBA8_UNORM", bytes: 4, elements: 4 },
    [Format.RGBA8_UINT]: { name: "RGBA8_UINT", bytes: 4, elements: 4 },
    [Format.RGBA8_SRGB]: { name: "RGBA8_SRGB", bytes: 4, elements: 4 },
    [Format.BGRA8_UNORM]: { name: "BGRA8_UNORM", bytes: 4, elements: 4 },
    [Format.R16_UINT]: { name: "R16_UINT", bytes: 2, elements: 1 },
    [Format.RGBA16_UINT]: { name: "RGBA16_UINT", bytes: 8, elements: 4 },
    [Format.R32_UINT]: { name: "R32_UINT", bytes: 4, elements: 1 },
    [Format.RG32_SFLOAT]: { name: "RG32_SFLOAT", bytes: 8, elements: 2 },
    [Format.RGB32_SFLOAT]: { name: "RGB32_SFLOAT", bytes: 12, elements: 3 },
    [Format.RGBA32_UINT]: { name: "RGBA32_UINT", bytes: 16, elements: 4 },
    [Format.RGBA32_SFLOAT]: { name: "RGBA32_SFLOAT", bytes: 16, elements: 4 },
    [Format.D32_SFLOAT]: { name: "D32_SFLOAT", bytes: 44, elements: 1 },
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
    SHADER_READ_ONLY = 5,
    PRESENT_SRC = 1000001002,
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

// copy values from VkPipelineStageFlagBits in vulkan_core.h
export enum PipelineStageFlagBits {
    COLOR_ATTACHMENT_OUTPUT = 0x00000400
}