import Buffer from "../../../core/gfx/Buffer.js";
import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import DescriptorSet from "../../../core/gfx/DescriptorSet.js";
import DescriptorSetLayout from "../../../core/gfx/DescriptorSetLayout.js";
import Device, { Capabilities, Swapchain } from "../../../core/gfx/Device.js";
import Fence from "../../../core/gfx/Fence.js";
import { Framebuffer } from "../../../core/gfx/Framebuffer.js";
import InputAssembler from "../../../core/gfx/InputAssembler.js";
import Pipeline, { PipelineLayout } from "../../../core/gfx/Pipeline.js";
import Queue from "../../../core/gfx/Queue.js";
import RenderPass from "../../../core/gfx/RenderPass.js";
import { Sampler } from "../../../core/gfx/Sampler.js";
import Semaphore from "../../../core/gfx/Semaphore.js";
import Shader from "../../../core/gfx/Shader.js";
import Texture from "../../../core/gfx/Texture.js";
import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebDescriptorSetLayout from "./WebDescriptorSetLayout.js";
import WebFence from "./WebFence.js";
import WebFramebuffer from "./WebFramebuffer.js";
import WebInputAssembler from "./WebInputAssembler.js";
import WebPipeline from "./WebPipeline.js";
import WebPipelineLayout from "./WebPipelineLayout.js";
import WebQueue from "./WebQueue.js";
import WebRenderPass from "./WebRenderPass.js";
import WebSampler from "./WebSampler.js";
import WebSemaphore from "./WebSemaphore.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

export default class WebDevice implements Device {
    private _gl: WebGL2RenderingContext;

    private _capabilities: Capabilities;
    get capabilities(): Capabilities {
        return this._capabilities;
    }

    private _swapchain: Swapchain = { colorTexture: { info: { samples: 1 } } as any };
    get swapchain(): Swapchain {
        return this._swapchain;
    }

    private _queue: Queue = new WebQueue;
    get queue(): Queue {
        return this._queue;
    }

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })!;
        this._capabilities = {
            uniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        }
        this._gl = gl;
    }

    initialize(): boolean {
        return false;
    }

    createCommandBuffer(): CommandBuffer {
        return new WebCommandBuffer(this._gl);
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

    createInputAssembler(): InputAssembler {
        return new WebInputAssembler;
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

    createRenderPass(): RenderPass {
        return new WebRenderPass;
    }

    createFramebuffer(): Framebuffer {
        return new WebFramebuffer(this._gl);
    }

    createSemaphore(): Semaphore {
        return new WebSemaphore;
    }

    createTexture(): Texture {
        return new WebTexture(this._gl);
    }

    createSampler(): Sampler {
        return new WebSampler(this._gl);
    }

    createFence(): Fence {
        return new WebFence;
    }

    acquire(semaphore: Semaphore): void { }
}