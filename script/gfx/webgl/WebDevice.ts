import type { Buffer, Capabilities, CommandBuffer, DescriptorSet, DescriptorSetLayout, Device, Fence, Framebuffer, InputAssembler, Pipeline, PipelineLayout, Queue, RenderPass, Sampler, Semaphore, Shader, Swapchain, Texture } from "gfx-main";
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

export class WebDevice implements Device {
    private _capabilities: Capabilities;
    get capabilities(): Capabilities {
        return this._capabilities;
    }

    private _swapchain: Swapchain;
    get swapchain(): Swapchain {
        return this._swapchain;
    }

    private _queue: Queue = new WebQueue;
    get queue(): Queue {
        return this._queue;
    }

    constructor(private _gl: WebGL2RenderingContext, width: number, height: number) {
        this._capabilities = {
            uniformBufferOffsetAlignment: _gl.getParameter(_gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        }
        this._swapchain = { colorTexture: new WebTexture(_gl, true), width, height };
    }

    createCommandBuffer(): CommandBuffer {
        return new WebCommandBuffer(this._gl);
    }

    createDescriptorSetLayout(): DescriptorSetLayout {
        return new WebDescriptorSetLayout();
    }

    createDescriptorSet(): DescriptorSet {
        return new WebDescriptorSet();
    }

    createPipelineLayout(): PipelineLayout {
        return new WebPipelineLayout();
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