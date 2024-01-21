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
export class Device {
    get capabilities() {
        return this._capabilities;
    }
    get swapchain() {
        return this._swapchain;
    }
    get queue() {
        return this._queue;
    }
    constructor(gl) {
        this._queue = new Queue;
        this._capabilities = {
            uniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        };
        this._swapchain = { colorTexture: new Texture(gl, true), width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
        this._gl = gl;
    }
    acquire(semaphore) { }
    createBuffer(info) {
        const buffer = new Buffer(this._gl);
        buffer.initialize(info);
        return buffer;
    }
    createCommandBuffer() {
        return new CommandBuffer(this._gl);
    }
    createDescriptorSet(layout) {
        const descriptorSet = new DescriptorSet();
        descriptorSet.initialize(layout);
        return descriptorSet;
    }
    createDescriptorSetLayout(info) {
        const descriptorSetLayout = new DescriptorSetLayout();
        descriptorSetLayout.initialize(info);
        return descriptorSetLayout;
    }
    createFence(signaled) {
        return new Fence;
    }
    createFramebuffer(info) {
        const framebuffer = new Framebuffer(this._gl);
        framebuffer.initialize(info);
        return framebuffer;
    }
    createInputAssembler(info) {
        const inputAssembler = new InputAssembler;
        inputAssembler.initialize(info);
        return inputAssembler;
    }
    createPipeline(info) {
        const pipeline = new Pipeline();
        pipeline.initialize(info);
        return pipeline;
    }
    createPipelineLayout(info) {
        const pipelineLayout = new PipelineLayout();
        pipelineLayout.initialize(info);
        return pipelineLayout;
    }
    createRenderPass(info) {
        const renderPass = new RenderPass;
        renderPass.initialize(info);
        return renderPass;
    }
    createSampler(info) {
        const sampler = new Sampler(this._gl);
        sampler.initialize(info);
        return sampler;
    }
    createSemaphore() {
        return new Semaphore;
    }
    createShader(info) {
        const shader = new Shader(this._gl);
        shader.initialize(info);
        return shader;
    }
    createTexture(info) {
        const texture = new Texture(this._gl);
        texture.initialize(info);
        return texture;
    }
}
