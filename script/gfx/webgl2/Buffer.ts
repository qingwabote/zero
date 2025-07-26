import { BufferInfo } from "./info.js";

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

        const target = this.info.usage as unknown as GLenum;
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, this.info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);

        return false;
    }

    upload(src: ArrayBufferView, src_offset: number, src_length: number, dst_offset_bytes: number): void {
        const gl = this._gl;

        const target = this.info.usage as unknown as GLenum;
        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, dst_offset_bytes, src, src_offset, src_length);
        gl.bindBuffer(target, null);
    }

    resize(size: number): void {
        this.info.size = size;
        this.initialize();
    }
}