import { Buffer, BufferInfo, Device, Shader, ShaderInfo } from "../../../core/gfx";
import WebBuffer from "./WebBuffer.js";
import WebShader from "./WebShader.js";

export default class WebDevice implements Device {
    private _gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    createShader(info: ShaderInfo): Shader {
        return new WebShader(this._gl, info);
    }

    createBuffer(info: BufferInfo): Buffer {
        return new WebBuffer(this._gl, info);
    }
}