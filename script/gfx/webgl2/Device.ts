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
import { BufferInfo, DescriptorSetLayoutInfo, FramebufferInfo, InputAssemblerInfo, PipelineInfo, PipelineLayoutInfo, RenderPassInfo, SamplerInfo, ShaderInfo, TextureInfo } from "./info.js";

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

    acquire(semaphore: Semaphore): void { }

    createBuffer(info: BufferInfo): Buffer {
        const buffer = new Buffer(this._gl);
        buffer.initialize(info);
        return buffer;
    }

    createCommandBuffer(): CommandBuffer {
        return new CommandBuffer(this._gl);
    }

    createDescriptorSet(layout: DescriptorSetLayout): DescriptorSet {
        const descriptorSet = new DescriptorSet();
        descriptorSet.initialize(layout);
        return descriptorSet;
    }

    createDescriptorSetLayout(info: DescriptorSetLayoutInfo): DescriptorSetLayout {
        const descriptorSetLayout = new DescriptorSetLayout();
        descriptorSetLayout.initialize(info);
        return descriptorSetLayout;
    }

    createFence(signaled?: boolean): Fence {
        return new Fence;
    }

    createFramebuffer(info: FramebufferInfo): Framebuffer {
        const framebuffer = new Framebuffer(this._gl);
        framebuffer.initialize(info);
        return framebuffer;
    }

    createInputAssembler(info: InputAssemblerInfo): InputAssembler {
        const inputAssembler = new InputAssembler;
        inputAssembler.initialize(info);
        return inputAssembler;
    }

    createPipeline(info: PipelineInfo): Pipeline {
        const pipeline = new Pipeline();
        pipeline.initialize(info);
        return pipeline;
    }

    createPipelineLayout(info: PipelineLayoutInfo): PipelineLayout {
        const pipelineLayout = new PipelineLayout();
        pipelineLayout.initialize(info);
        return pipelineLayout;
    }

    createRenderPass(info: RenderPassInfo): RenderPass {
        const renderPass = new RenderPass
        renderPass.initialize(info);
        return renderPass;
    }

    createSampler(info: SamplerInfo): Sampler {
        const sampler = new Sampler(this._gl);
        sampler.initialize(info);
        return sampler;
    }

    createSemaphore(): Semaphore {
        return new Semaphore;
    }

    createShader(info: ShaderInfo): Shader {
        const shader = new Shader(this._gl);
        shader.initialize(info);
        return shader;
    }

    createTexture(info: TextureInfo): Texture {
        const texture = new Texture(this._gl);
        texture.initialize(info);
        return texture;
    }
}