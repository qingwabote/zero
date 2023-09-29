import { BufferUsageFlagBits } from "gfx-common";
import { BufferInfo } from "./info.js";

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

export class Buffer {
    private _impl: WebGLBuffer;
    get impl(): WebGLBuffer {
        return this._impl;
    }

    private _info!: BufferInfo;
    get info(): BufferInfo {
        return this._info;
    }

    constructor(private _gl: WebGL2RenderingContext) {
        this._impl = _gl.createBuffer()!
    }

    initialize(info: BufferInfo): boolean {
        this._info = info;
        this.resize(info.size);
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

    resize(size: number): void {
        const gl = this._gl;

        const target = usage2target(this._info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
    }
}