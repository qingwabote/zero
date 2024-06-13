import { BufferUsageFlagBits } from "gfx-common";
function usage2target(usage) {
    if (usage & BufferUsageFlagBits.VERTEX) {
        return WebGL2RenderingContext.ARRAY_BUFFER;
    }
    else if (usage & BufferUsageFlagBits.INDEX) {
        return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
    }
    else if (usage & BufferUsageFlagBits.UNIFORM) {
        return WebGL2RenderingContext.UNIFORM_BUFFER;
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
    update(buffer, offset, length) {
        const gl = this._gl;
        const target = usage2target(this.info.usage);
        gl.bindVertexArray(null);
        gl.bindBuffer(target, this._impl);
        // gl.bufferSubData(target, 0, new DataView(buffer, offset, length)); // DataView does not work in wx ios.
        gl.bufferSubData(target, 0, new Uint8Array(buffer, offset, length));
        gl.bindBuffer(target, null);
    }
    resize(size) {
        const gl = this._gl;
        const target = usage2target(this.info.usage);
        gl.bindBuffer(target, this._impl);
        gl.bufferData(target, size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
    }
}
