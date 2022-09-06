import Buffer, { BufferInfo, BufferUsageBit } from "../../../core/gfx/Buffer.js";

function usage2target(usage: BufferUsageBit): GLenum {
    if (usage & BufferUsageBit.VERTEX) {
        return WebGL2RenderingContext.ARRAY_BUFFER;
    } else if (usage & BufferUsageBit.INDEX) {
        return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
    } else if (usage & BufferUsageBit.UNIFORM) {
        return WebGL2RenderingContext.UNIFORM_BUFFER;
    }
    return -1;
}

export default class WebBuffer implements Buffer {
    private _gl: WebGL2RenderingContext;

    private _buffer!: WebGLBuffer;
    get buffer(): WebGLBuffer {
        return this._buffer;
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

        this._buffer = gl.createBuffer()!
        const target = usage2target(info.usage);
        gl.bindBuffer(target, this._buffer);
        gl.bufferData(target, info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);

        this._info = info;

        return false;
    }

    update(buffer: Readonly<BufferSource>): void {
        const gl = this._gl;
        if (!gl) return;

        const target = usage2target(this._info.usage);

        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._buffer);
        gl.bufferSubData(target, 0, buffer);

        gl.bindBuffer(target, null);
    }
}