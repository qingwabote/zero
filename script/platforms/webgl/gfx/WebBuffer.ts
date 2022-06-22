import { Buffer, BufferInfo, BufferUsageBit } from "../../../core/gfx.js";

export default class WebBuffer extends Buffer {
    private _gl: WebGL2RenderingContext;

    private _buffer: WebGLBuffer;
    get buffer(): WebGLBuffer {
        return this._buffer;
    }

    constructor(gl: WebGL2RenderingContext, info: BufferInfo) {
        super(info);
        this._buffer = gl.createBuffer()!
        if (this._info.usage & BufferUsageBit.VERTEX) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
            gl.bufferData(gl.ARRAY_BUFFER, info.size, gl.DYNAMIC_DRAW);
        }
        this._gl = gl;
    }

    public update(buffer: Readonly<ArrayBuffer>): void {
        const gl = this._gl;
        if (this._info.usage & BufferUsageBit.VERTEX) {
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, this._info.offset, buffer);
        } else if (this._info.usage & BufferUsageBit.INDEX) {

        } else if (this._info.usage & BufferUsageBit.UNIFORM) {

        }
    }
}