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
    constructor(_gl) {
        this._gl = _gl;
        this._queue = new Queue;
        this._capabilities = {
            uniformBufferOffsetAlignment: _gl.getParameter(_gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        };
        this._swapchain = new Swapchain(_gl);
    }
    createBuffer(info) {
        const buffer = new Buffer(this._gl, info);
        buffer.initialize();
        return buffer;
    }
    createCommandBuffer() {
        return new CommandBuffer(this._gl);
    }
    createDescriptorSet(layout) {
        return new DescriptorSet(layout);
    }
    createDescriptorSetLayout(info) {
        return new DescriptorSetLayout(info);
    }
    createFence(signaled) {
        return new Fence;
    }
    createFramebuffer(info) {
        const framebuffer = new Framebuffer(this._gl, info);
        framebuffer.initialize();
        return framebuffer;
    }
    createPipeline(info) {
        return new Pipeline(info);
    }
    createPipelineLayout(info) {
        return new PipelineLayout(info);
    }
    createRenderPass(info) {
        return new RenderPass(info);
    }
    createSampler(info) {
        const sampler = new Sampler(this._gl, info);
        sampler.initialize();
        return sampler;
    }
    createSemaphore() {
        return new Semaphore;
    }
    createShader(info) {
        const shader = new Shader(this._gl, info);
        shader.initialize();
        return shader;
    }
    createTexture(info) {
        const texture = new Texture(this._gl, info);
        texture.initialize();
        return texture;
    }
    waitForFence(fence) { }
}