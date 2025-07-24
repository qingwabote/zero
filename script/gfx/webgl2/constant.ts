import * as gfx from "gfx";

export const Filter = {
    NEAREST: 0x2600 as unknown as typeof gfx.Filter.NEAREST,
    LINEAR: 0x2601 as unknown as typeof gfx.Filter.LINEAR
} as const;

export const BufferUsageFlagBits = {
    NONE: 0 as unknown as typeof gfx.BufferUsageFlagBits.NONE,
    TRANSFER_DST: 0 as unknown as typeof gfx.BufferUsageFlagBits.TRANSFER_DST,
    UNIFORM: 0x8A11 as unknown as typeof gfx.BufferUsageFlagBits.UNIFORM,
    INDEX: 0x8893 as unknown as typeof gfx.BufferUsageFlagBits.INDEX,
    VERTEX: 0x8892 as unknown as typeof gfx.BufferUsageFlagBits.VERTEX,
} as const;
export type BufferUsageFlagBits = gfx.BufferUsageFlagBits;

export const ShaderStageFlagBits = {
    NONE: 0 as unknown as typeof gfx.ShaderStageFlagBits.NONE,
    VERTEX: 0x8B31 as unknown as typeof gfx.ShaderStageFlagBits.VERTEX,
    FRAGMENT: 0x8B30 as unknown as typeof gfx.ShaderStageFlagBits.FRAGMENT,
} as const;
export type ShaderStageFlagBits = gfx.ShaderStageFlagBits;

export const BlendFactor = {
    ZERO: 0 as unknown as typeof gfx.BlendFactor.ZERO,
    ONE: 1 as unknown as typeof gfx.BlendFactor.ONE,
    SRC_ALPHA: 0x0302 as unknown as typeof gfx.BlendFactor.SRC_ALPHA,
    ONE_MINUS_SRC_ALPHA: 0x0303 as unknown as typeof gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
    DST_ALPHA: 0x0304 as unknown as typeof gfx.BlendFactor.DST_ALPHA,
    ONE_MINUS_DST_ALPHA: 0x0305 as unknown as typeof gfx.BlendFactor.ONE_MINUS_DST_ALPHA,
}
export type BlendFactor = gfx.BlendFactor;

export const PrimitiveTopology = {
    POINT_LIST: 0x0000 as unknown as typeof gfx.PrimitiveTopology.POINT_LIST,
    LINE_LIST: 0x0001 as unknown as typeof gfx.PrimitiveTopology.LINE_LIST,
    TRIANGLE_LIST: 0x0004 as unknown as typeof gfx.PrimitiveTopology.TRIANGLE_LIST,
} as const;
export type PrimitiveTopology = gfx.PrimitiveTopology;

export declare const kind: any;