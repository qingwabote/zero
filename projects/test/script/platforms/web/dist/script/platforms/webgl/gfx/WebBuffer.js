import { BufferUsageFlagBits } from "../../../core/gfx/Buffer.js";
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
export default class WebBuffer {
    _gl;
    _buffer;
    get buffer() {
        return this._buffer;
    }
    _info;
    get info() {
        return this._info;
    }
    constructor(gl) {
        this._gl = gl;
    }
    initialize(info) {
        const gl = this._gl;
        this._buffer = gl.createBuffer();
        const target = usage2target(info.usage);
        gl.bindBuffer(target, this._buffer);
        gl.bufferData(target, info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
        this._info = info;
        return false;
    }
    update(buffer) {
        const gl = this._gl;
        const target = usage2target(this._info.usage);
        gl.bindVertexArray(null);
        gl.bindBuffer(target, this._buffer);
        gl.bufferSubData(target, 0, buffer);
        gl.bindBuffer(target, null);
    }
    destroy() {
        const gl = this._gl;
        gl.deleteBuffer(this._buffer);
    }
}
//# sourceMappingURL=WebBuffer.js.map