import Buffer, { BufferInfo } from "../../../core/gfx/Buffer.js";
import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import Device from "../../../core/gfx/Device.js";
import Pipeline from "../../../core/gfx/Pipeline.js";
import Shader from "../../../core/gfx/Shader.js";
import Texture, { TextureInfo } from "../../../core/gfx/Texture.js";
import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebPipeline from "./WebPipeline.js";
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

    initialize(): boolean {
        throw new Error("Method not implemented.");
    }

    createPipeline(): Pipeline {
        return new WebPipeline();
    }

    createShader(): Shader {
        return new WebShader(this._gl);
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