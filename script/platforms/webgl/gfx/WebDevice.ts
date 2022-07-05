import Buffer, { BufferInfo } from "../../../core/Buffer.js";
import CommandBuffer from "../../../core/CommandBuffer.js";
import Device from "../../../core/Device.js";
import Shader, { ShaderInfo } from "../../../core/Shader.js";
import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebShader from "./WebShader.js";

export default class WebDevice implements Device {
    private _gl: WebGL2RenderingContext;

    private _commandBuffer: CommandBuffer;
    get commandBuffer(): CommandBuffer {
        return this._commandBuffer;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._commandBuffer = new WebCommandBuffer(gl);
        this._gl = gl;
    }

    createShader(info: ShaderInfo): Shader {
        return new WebShader(this._gl, info);
    }

    createBuffer(info: BufferInfo): Buffer {
        return new WebBuffer(this._gl, info);
    }
}