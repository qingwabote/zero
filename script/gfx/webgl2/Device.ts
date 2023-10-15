import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Fence } from "./Fence.js";
import { Framebuffer } from "./Framebuffer.js";
import { InputAssembler } from "./InputAssembler.js";
import { Pipeline } from "./Pipeline.js";
import { PipelineLayout } from "./PipelineLayout.js";
import { Queue } from "./Queue.js";
import { RenderPass } from "./RenderPass.js";
import { Sampler } from "./Sampler.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

export interface Capabilities {
    readonly uniformBufferOffsetAlignment: number
    readonly clipSpaceMinZ: number
}

export interface Swapchain {
    readonly colorTexture: Texture;
    readonly width: number;
    readonly height: number
}

export class Device implements Device {
    private readonly _gl: WebGL2RenderingContext

    private _capabilities: Capabilities;
    get capabilities(): Capabilities {
        return this._capabilities;
    }

    private _swapchain: Swapchain;
    get swapchain(): Swapchain {
        return this._swapchain;
    }

    private _queue: Queue = new Queue;
    get queue(): Queue {
        return this._queue;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._capabilities = {
            uniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        }
        this._swapchain = { colorTexture: new Texture(gl, true), width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
        this._gl = gl;
    }

    createCommandBuffer(): CommandBuffer {
        return new CommandBuffer(this._gl);
    }

    createDescriptorSetLayout(): DescriptorSetLayout {
        return new DescriptorSetLayout();
    }

    createDescriptorSet(): DescriptorSet {
        return new DescriptorSet();
    }

    createPipelineLayout(): PipelineLayout {
        return new PipelineLayout();
    }

    createInputAssembler(): InputAssembler {
        return new InputAssembler;
    }

    createPipeline(): Pipeline {
        return new Pipeline();
    }

    createShader(): Shader {
        return new Shader(this._gl);
    }

    createBuffer(): Buffer {
        return new Buffer(this._gl);
    }

    createRenderPass(): RenderPass {
        return new RenderPass;
    }

    createFramebuffer(): Framebuffer {
        return new Framebuffer(this._gl);
    }

    createSemaphore(): Semaphore {
        return new Semaphore;
    }

    createTexture(): Texture {
        return new Texture(this._gl);
    }

    createSampler(): Sampler {
        return new Sampler(this._gl);
    }

    createFence(): Fence {
        return new Fence;
    }

    acquire(semaphore: Semaphore): void { }
}