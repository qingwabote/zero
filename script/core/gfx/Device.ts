import Buffer from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import DescriptorSet from "./DescriptorSet.js";
import DescriptorSetLayout from "./DescriptorSetLayout.js";
import Fence from "./Fence.js";
import { Framebuffer } from "./Framebuffer.js";
import Pipeline, { PipelineLayout } from "./Pipeline.js";
import RenderPass from "./RenderPass.js";
import { Sampler } from "./Sampler.js";
import Semaphore from "./Semaphore.js";
import Shader from "./Shader.js";
import { SubmitInfo } from "./SubmitInfo.js";
import Texture from "./Texture.js";

export interface Capabilities {
    readonly uniformBufferOffsetAlignment: number
    readonly clipSpaceMinZ: number
}

export interface Swapchain {
    readonly colorTexture: Texture;
}

export default interface Device {
    get capabilities(): Capabilities;

    get swapchain(): Swapchain;

    createDescriptorSetLayout(): DescriptorSetLayout;

    createDescriptorSet(): DescriptorSet;

    createPipelineLayout(): PipelineLayout;

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

    submit(info: SubmitInfo, fence: Fence): void;

    present(waitSemaphore: Semaphore): void;

    waitFence(fence: Fence): void;
}