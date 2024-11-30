import { BufferUsageFlagBits } from "gfx-common";
function usage2target(gl, usage) {
    if (usage & BufferUsageFlagBits.VERTEX) {
        return gl.ARRAY_BUFFER;
    }
    else if (usage & BufferUsageFlagBits.INDEX) {
        return gl.ELEMENT_ARRAY_BUFFER;
    }
    else if (usage & BufferUsageFlagBits.UNIFORM) {
        return gl.UNIFORM_BUFFER;
    }
    return -1;
}
export class Buffer {
    get impl() {
        return this._impl;
    }
    constructor(_gl, info) {
        this._gl = _gl;
        this.info = info;
        this._impl = _gl.createBuffer();
    }
    initialize() {
        const gl = this._gl;
        const target = usage2target(gl, this.info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, this.info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
        return false;
    }
    update(src, src_offset, src_length, dst_offset) {
        const gl = this._gl;
        const target = usage2target(gl, this.info.usage);
        gl.bindVertexArray(null);
        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, dst_offset, src, src_offset, src_length);
        gl.bindBuffer(target, null);
    }
    resize(size) {
        this.info.size = size;
        this.initialize();
    }
}
