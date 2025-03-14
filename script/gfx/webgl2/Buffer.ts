import { BufferInfo } from "./info.js";
import { BufferUsageFlagBits } from "./shared/constants.js";

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
        const gl = this._gl;

        const target = usage2target(gl, this.info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, this.info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);

        return false;
    }

    upload(src: ArrayBufferView, src_offset: number, src_length: number, dst_offset: number): void {
        const gl = this._gl;

        const target = usage2target(gl, this.info.usage);

        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, dst_offset, src, src_offset, src_length);

        gl.bindBuffer(target, null);
    }

    resize(size: number): void {
        this.info.size = size;
        this.initialize();
    }
}