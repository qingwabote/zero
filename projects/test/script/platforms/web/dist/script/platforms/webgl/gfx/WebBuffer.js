import Buffer, { BufferUsageBit } from "../../../core/gfx/Buffer.js";
function usage2target(usage) {
    if (usage & BufferUsageBit.VERTEX) {
        return WebGL2RenderingContext.ARRAY_BUFFER;
    }
    else if (usage & BufferUsageBit.INDEX) {
        return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
    }
    else if (usage & BufferUsageBit.UNIFORM) {
        return WebGL2RenderingContext.UNIFORM_BUFFER;
    }
    return -1;
}
export default class WebBuffer extends Buffer {
    _gl = null;
    _buffer;
    get buffer() {
        return this._buffer;
    }
    constructor(gl, info) {
        super(info);
        this._buffer = gl.createBuffer();
        const target = usage2target(info.usage);
        gl.bindBuffer(target, this._buffer);
        gl.bufferData(target, info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);
        this._gl = gl;
    }
    update(buffer) {
        const gl = this._gl;
        if (!gl)
            return;
        const target = usage2target(this._info.usage);
        gl.bindVertexArray(null);
        gl.bindBuffer(target, this._buffer);
        gl.bufferSubData(target, 0, buffer);
        gl.bindBuffer(target, null);
    }
}
//# sourceMappingURL=WebBuffer.js.map