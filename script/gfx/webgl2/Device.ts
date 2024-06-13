import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Fence } from "./Fence.js";
import { Framebuffer } from "./Framebuffer.js";
import { Pipeline } from "./Pipeline.js";
import { PipelineLayout } from "./PipelineLayout.js";
import { Queue } from "./Queue.js";
import { RenderPass } from "./RenderPass.js";
import { Sampler } from "./Sampler.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Swapchain } from "./Swapchain.js";
import { Texture } from "./Texture.js";
import { BufferInfo, DescriptorSetLayoutInfo, FramebufferInfo, PipelineInfo, PipelineLayoutInfo, RenderPassInfo, SamplerInfo, ShaderInfo, TextureInfo } from "./info.js";

interface Capabilities {
    readonly uniformBufferOffsetAlignment: number
    readonly clipSpaceMinZ: number
}

export class Device implements Device {
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

    constructor(private _gl: WebGL2RenderingContext) {
        this._capabilities = {
            uniformBufferOffsetAlignment: _gl.getParameter(_gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        }
        this._swapchain = new Swapchain(_gl);
    }

    createBuffer(info: BufferInfo): Buffer {
        const buffer = new Buffer(this._gl, info);
        buffer.initialize();
        return buffer;
    }

    createCommandBuffer(): CommandBuffer {
        return new CommandBuffer(this._gl);
    }

    createDescriptorSet(layout: DescriptorSetLayout): DescriptorSet {
        const descriptorSet = new DescriptorSet(layout);
        descriptorSet.initialize();
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
        const framebuffer = new Framebuffer(this._gl, info);
        framebuffer.initialize();
        return framebuffer;
    }

    createPipeline(info: PipelineInfo): Pipeline {
        const pipeline = new Pipeline(info);
        pipeline.initialize();
        return pipeline;
    }

    createPipelineLayout(info: PipelineLayoutInfo): PipelineLayout {
        const pipelineLayout = new PipelineLayout(info);
        pipelineLayout.initialize();
        return pipelineLayout;
    }

    createRenderPass(info: RenderPassInfo): RenderPass {
        const renderPass = new RenderPass(info)
        renderPass.initialize();
        return renderPass;
    }

    createSampler(info: SamplerInfo): Sampler {
        const sampler = new Sampler(this._gl, info);
        sampler.initialize();
        return sampler;
    }

    createSemaphore(): Semaphore {
        return new Semaphore;
    }

    createShader(info: ShaderInfo): Shader {
        const shader = new Shader(this._gl, info);
        shader.initialize();
        return shader;
    }

    createTexture(info: TextureInfo): Texture {
        const texture = new Texture(this._gl, info);
        texture.initialize();
        return texture;
    }
}