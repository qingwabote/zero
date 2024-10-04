import { Format } from "gfx-common";

const gl = WebGL2RenderingContext;

export const Formats: Readonly<Record<Format, { internalformat: GLenum, format: GLenum, type: GLenum }>> = {
    [Format.UNDEFINED]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.R8_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGBA8_UNORM]: {
        internalformat: gl.RGBA8,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE
    },
    [Format.RGBA8_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGBA8_SRGB]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.BGRA8_UNORM]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.R16_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGBA16_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.R32_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RG32_SFLOAT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGB32_SFLOAT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGBA32_UINT]: {
        internalformat: 0,
        format: 0,
        type: 0
    },
    [Format.RGBA32_SFLOAT]: {
        internalformat: gl.RGBA32F,
        format: gl.RGBA,
        type: gl.FLOAT
    },
    [Format.D32_SFLOAT]: {
        internalformat: gl.DEPTH_COMPONENT32F,
        format: 0,
        type: 0
    }
}