import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Fence } from "./Fence.js";
import { Framebuffer } from "./Framebuffer.js";
import { Pipeline, PipelineLayout } from "./Pipeline.js";
import { Queue } from "./Queue.js";
import { RenderPass } from "./RenderPass.js";
import { Sampler } from "./Sampler.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Swapchain } from "./Swapchain.js";
import { Texture } from "./Texture.js";
import { BufferInfo, DescriptorSetLayoutInfo, FramebufferInfo, PipelineInfo, PipelineLayoutInfo, RenderPassInfo, SamplerInfo, ShaderInfo, TextureInfo } from "./info.js";

declare interface Capabilities {
    /**"The value must be a power of two" https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDeviceLimits.html*/
    readonly uniformBufferOffsetAlignment: number
    readonly clipSpaceMinZ: number
}

export declare class Device {
    get capabilities(): Capabilities;
    get swapchain(): Swapchain;
    get queue(): Queue;

    constructor(...args);

    createBuffer(info: BufferInfo): Buffer;
    createCommandBuffer(): CommandBuffer;
    createDescriptorSet(layout: DescriptorSetLayout): DescriptorSet;
    createDescriptorSetLayout(info: DescriptorSetLayoutInfo): DescriptorSetLayout;
    createFence(signaled?: boolean): Fence;
    createFramebuffer(info: FramebufferInfo): Framebuffer;
    createPipeline(info: PipelineInfo): Pipeline;
    createPipelineLayout(info: PipelineLayoutInfo): PipelineLayout;
    createRenderPass(info: RenderPassInfo): RenderPass;
    createSampler(info: SamplerInfo): Sampler;
    createSemaphore(): Semaphore;
    createShader(info: ShaderInfo): Shader;
    createTexture(info: TextureInfo): Texture;
}