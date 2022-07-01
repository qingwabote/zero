import { Buffer, BufferInfo, BufferUsageBit } from "../../../core/gfx.js";

export default class WebBuffer extends Buffer {
    private _gl: WebGL2RenderingContext | null = null;

    private _buffer: WebGLBuffer;
    get buffer(): WebGLBuffer {
        return this._buffer;
    }

    constructor(gl: WebGL2RenderingContext, info: BufferInfo) {
        super(info);
        this._buffer = gl.createBuffer()!
        let target: GLenum;
        if (this._info.usage & BufferUsageBit.VERTEX) {
            target = gl.ARRAY_BUFFER;
        } else if (this._info.usage & BufferUsageBit.INDEX) {
            target = gl.ELEMENT_ARRAY_BUFFER;
        } else {
            return;
        }
        gl.bindBuffer(target, this._buffer);
        gl.bufferData(target, info.size, gl.DYNAMIC_DRAW);

        gl.bindBuffer(target, null);
        this._gl = gl;
    }

    public update(buffer: Readonly<BufferSource>): void {
        const gl = this._gl;
        if (!gl) return;

        let target: GLenum;
        if (this._info.usage & BufferUsageBit.VERTEX) {
            target = gl.ARRAY_BUFFER;
        } else if (this._info.usage & BufferUsageBit.INDEX) {
            target = gl.ELEMENT_ARRAY_BUFFER;
        } else {
            return;
        }
        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._buffer);
        gl.bufferSubData(target, 0, buffer);
    }
}