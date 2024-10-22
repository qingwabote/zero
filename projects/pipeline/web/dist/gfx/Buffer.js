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
        this.resize(this.info.size);
        return false;
    }
    update(src, src_offset, src_length) {
        const gl = this._gl;
        const target = usage2target(gl, this.info.usage);
        gl.bindVertexArray(null);
        gl.bindBuffer(target, this._impl);
        gl.bufferSubData(target, 0, src, src_offset, src_length);
        gl.bindBuffer(target, null);
    }
    resize(size) {
        const gl = this._gl;
        const target = usage2target(gl, this.info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
    }
}
