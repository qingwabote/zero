import Buffer from "../../../main/core/gfx/Buffer.js";
import { BufferInfo, BufferUsageFlagBits } from "../../../main/core/gfx/info.js";

function usage2target(usage: BufferUsageFlagBits): GLenum {
    if (usage & BufferUsageFlagBits.VERTEX) {
        return WebGL2RenderingContext.ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.INDEX) {
        return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.UNIFORM) {
        return WebGL2RenderingContext.UNIFORM_BUFFER;
    }
    return -1;
}

export default class WebBuffer implements Buffer {
    private _gl: WebGL2RenderingContext;

    private _impl!: WebGLBuffer;
    get impl(): WebGLBuffer {
        return this._impl;
    }

    private _info!: BufferInfo;
    get info(): BufferInfo {
        return this._info;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: BufferInfo): boolean {
        const gl = this._gl;

        const impl = gl.createBuffer()!
        const target = usage2target(info.usage);
        gl.bindBuffer(target, impl);
        gl.bufferData(target, info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);

        this._impl = impl;
        this._info = info;

        return false;
    }

    update(buffer: ArrayBuffer, offset: number, length: number): void {
        const gl = this._gl;

        const target = usage2target(this._info.usage);

        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, 0, new DataView(buffer, offset, length));

        gl.bindBuffer(target, null);
    }
}