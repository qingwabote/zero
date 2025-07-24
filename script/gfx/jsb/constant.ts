import * as gfx from "gfx";

// copy values from VkFilter in vulkan_core.h
export const Filter = {
    NEAREST: 0 as unknown as typeof gfx.Filter.NEAREST,
    LINEAR: 1 as unknown as typeof gfx.Filter.LINEAR
} as const;

// copy values from VkBufferUsageFlagBits in vulkan_core.h
export const BufferUsageFlagBits = {
    NONE: 0 as unknown as typeof gfx.BufferUsageFlagBits.NONE,
    TRANSFER_DST: 0x00000002 as unknown as typeof gfx.BufferUsageFlagBits.TRANSFER_DST,
    UNIFORM: 0x00000010 as unknown as typeof gfx.BufferUsageFlagBits.UNIFORM,
    INDEX: 0x00000040 as unknown as typeof gfx.BufferUsageFlagBits.INDEX,
    VERTEX: 0x00000080 as unknown as typeof gfx.BufferUsageFlagBits.VERTEX,
} as const;

// copy values from VkShaderStageFlagBits in vulkan_core.h
export const ShaderStageFlagBits = {
    NONE: 0 as unknown as typeof gfx.ShaderStageFlagBits.NONE,
    VERTEX: 0x1 as unknown as typeof gfx.ShaderStageFlagBits.VERTEX,
    FRAGMENT: 0x10 as unknown as typeof gfx.ShaderStageFlagBits.FRAGMENT
} as const;
export type ShaderStageFlagBits = gfx.ShaderStageFlagBits;

// copy values from VkBlendFactor in vulkan_core.h
export const BlendFactor = {
    ZERO: 0 as unknown as typeof gfx.BlendFactor.ZERO,
    ONE: 1 as unknown as typeof gfx.BlendFactor.ONE,
    SRC_ALPHA: 6 as unknown as typeof gfx.BlendFactor.SRC_ALPHA,
    ONE_MINUS_SRC_ALPHA: 7 as unknown as typeof gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
    DST_ALPHA: 8 as unknown as typeof gfx.BlendFactor.DST_ALPHA,
    ONE_MINUS_DST_ALPHA: 9 as unknown as typeof gfx.BlendFactor.ONE_MINUS_DST_ALPHA,
} as const;
export type BlendFactor = gfx.BlendFactor;

// copy values from VkPrimitiveTopology in vulkan_core.h
export const PrimitiveTopology = {
    POINT_LIST: 0 as unknown as typeof gfx.PrimitiveTopology.POINT_LIST,
    LINE_LIST: 1 as unknown as typeof gfx.PrimitiveTopology.LINE_LIST,
    TRIANGLE_LIST: 3 as unknown as typeof gfx.PrimitiveTopology.TRIANGLE_LIST,
} as const;
export type PrimitiveTopology = gfx.PrimitiveTopology;

export declare const kind: any;