import { BufferUsageFlagBits } from "gfx-common";
import { BufferInfo } from "./info.js";

function usage2target(gl: WebGL2RenderingContext, usage: BufferUsageFlagBits): GLenum {
    if (usage & BufferUsageFlagBits.VERTEX) {
        return gl.ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.INDEX) {
        return gl.ELEMENT_ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.UNIFORM) {
        return gl.UNIFORM_BUFFER;
    }
    return -1;
}

export class Buffer {
    private _impl: WebGLBuffer;
    get impl(): WebGLBuffer {
        return this._impl;
    }

    constructor(private _gl: WebGL2RenderingContext, readonly info: BufferInfo) {
        this._impl = _gl.createBuffer()!
    }

    initialize(): boolean {
        this.resize(this.info.size);
        return false;
    }

    update(src: ArrayBufferView, src_offset: number, src_length: number): void {
        const gl = this._gl;

        const target = usage2target(gl, this.info.usage);

        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, 0, src, src_offset, src_length);

        gl.bindBuffer(target, null);
    }

    resize(size: number): void {
        const gl = this._gl;

        const target = usage2target(gl, this.info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
    }
}