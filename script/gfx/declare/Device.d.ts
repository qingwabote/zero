import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Fence } from "./Fence.js";
import { Framebuffer } from "./Framebuffer.js";
import { InputAssembler } from "./InputAssembler.js";
import { Pipeline, PipelineLayout } from "./Pipeline.js";
import { Queue } from "./Queue.js";
import { RenderPass } from "./RenderPass.js";
import { Sampler } from "./Sampler.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

export declare interface Capabilities {
    readonly uniformBufferOffsetAlignment: number
    readonly clipSpaceMinZ: number
}

export declare interface Swapchain {
    readonly colorTexture: Texture;
    readonly width: number;
    readonly height: number
}

export declare class Device {
    get capabilities(): Capabilities;

    get swapchain(): Swapchain;

    get queue(): Queue;

    constructor(...args);

    createDescriptorSetLayout(): DescriptorSetLayout;

    createDescriptorSet(): DescriptorSet;

    createPipelineLayout(): PipelineLayout;

    createInputAssembler(): InputAssembler;

    createPipeline(): Pipeline;

    createShader(): Shader;

    createBuffer(): Buffer;

    createTexture(): Texture;

    createSampler(): Sampler;

    createFramebuffer(): Framebuffer;

    createRenderPass(): RenderPass;

    createCommandBuffer(): CommandBuffer;

    createSemaphore(): Semaphore;

    createFence(): Fence;

    acquire(semaphore: Semaphore): void;
}