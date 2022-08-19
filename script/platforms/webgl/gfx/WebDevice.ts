import Buffer, { BufferInfo } from "../../../core/gfx/Buffer.js";
import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import Device from "../../../core/gfx/Device.js";
import Shader, { ShaderInfo } from "../../../core/gfx/Shader.js";
import Texture, { TextureInfo } from "../../../core/gfx/Texture.js";
import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

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
        const shader = new WebShader(this._gl);
        shader.initialize(info);
        return shader;
    }

    createBuffer(info: BufferInfo): Buffer {
        return new WebBuffer(this._gl, info);
    }

    createTexture(info: TextureInfo): Texture {
        const texture = new WebTexture(this._gl);
        texture.initialize(info);
        return texture;
    }

    createImageBitmap(blob: Blob): Promise<ImageBitmap> {
        return createImageBitmap(blob)
    }

    submit(commandBuffer: CommandBuffer): void {
        throw new Error("Method not implemented.");
    }
}