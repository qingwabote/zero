import Buffer from "../../../core/gfx/Buffer.js";
import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import Device, { Capabilities } from "../../../core/gfx/Device.js";
import Pipeline, { DescriptorSet, DescriptorSetLayout, PipelineLayout } from "../../../core/gfx/Pipeline.js";
import Shader from "../../../core/gfx/Shader.js";
import Texture, { TextureInfo } from "../../../core/gfx/Texture.js";
import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebDescriptorSetLayout from "./WebDescriptorSetLayout.js";
import WebPipeline from "./WebPipeline.js";
import WebPipelineLayout from "./WebPipelineLayout.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

export default class WebDevice implements Device {
    private _gl: WebGL2RenderingContext;

    private _capabilities: Capabilities;
    get capabilities(): Capabilities {
        return this._capabilities;
    }

    private _commandBuffer: CommandBuffer;
    get commandBuffer(): CommandBuffer {
        return this._commandBuffer;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._capabilities = {
            uniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)
        }
        this._commandBuffer = new WebCommandBuffer(gl);
        this._gl = gl;
    }

    initialize(): boolean {
        return false;
    }

    createDescriptorSetLayout(): DescriptorSetLayout {
        return new WebDescriptorSetLayout();
    }

    createPipelineLayout(): PipelineLayout {
        return new WebPipelineLayout();
    }

    createDescriptorSet(): DescriptorSet {
        return new WebDescriptorSet();
    }

    createPipeline(): Pipeline {
        return new WebPipeline();
    }

    createShader(): Shader {
        return new WebShader(this._gl);
    }

    createBuffer(): Buffer {
        return new WebBuffer(this._gl);
    }

    createTexture(info: TextureInfo): Texture {
        const texture = new WebTexture(this._gl);
        texture.initialize(info);
        return texture;
    }

    createImageBitmap(blob: Blob): Promise<ImageBitmap> {
        return createImageBitmap(blob)
    }

    present(): void { }
}