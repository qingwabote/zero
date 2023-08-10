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