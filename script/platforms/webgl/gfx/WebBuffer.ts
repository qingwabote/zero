import SmartRef from "../../../main/base/SmartRef.js";
import Buffer, { BufferInfo, BufferUsageFlagBits } from "../../../main/gfx/Buffer.js";

function usage2target(usage: BufferUsageFlagBits): GLenum {
    if (usage & BufferUsageFlagBits.VERTEX) {
        return WebGL2RenderingContext.ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.INDEX) {
        return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
    } else if (usage & BufferUsageFlagBits.UNIFORM) {
        return WebGL2RenderingContext.UNIFORM_BUFFER;
    }
    return -1;
}

export default class WebBuffer implements Buffer {
    private _gl: WebGL2RenderingContext;

    private _impl!: SmartRef<WebGLBuffer>;
    get impl(): SmartRef<WebGLBuffer> {
        return this._impl;
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

        const impl = new SmartRef(gl.createBuffer()!, gl.deleteBuffer, gl)
        const target = usage2target(info.usage);
        gl.bindBuffer(target, impl.deref());
        gl.bufferData(target, info.size, gl.STATIC_DRAW);
        gl.bindBuffer(target, null);

        this._impl = impl;
        this._info = info;

        return false;
    }

    update(buffer: ArrayBufferView): void {
        const gl = this._gl;

        const target = usage2target(this._info.usage);

        gl.bindVertexArray(null);

        gl.bindBuffer(target, this._impl.deref());
        gl.bufferSubData(target, 0, buffer);

        gl.bindBuffer(target, null);
    }
}