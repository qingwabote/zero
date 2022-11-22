import { Rect } from "../math/rect.js";
import Buffer from "./Buffer.js";
import { Framebuffer } from "./Framebuffer.js";
import Pipeline, { DescriptorSet, InputAssembler, PipelineLayout } from "./Pipeline.js";
import RenderPass from "./RenderPass.js";
import Texture from "./Texture.js";

export default interface CommandBuffer {
    initialize(): boolean;
    begin(): void;
    copyBuffer(srcBuffer: ArrayBufferView, dstBuffer: Buffer): void;
    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void;
    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, viewport: Rect): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(compatiblePipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[]): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void;
    end(): void;
}

export class EmptyCommandBuffer implements CommandBuffer {
    initialize(): boolean {
        return false;
    }
    begin(): void {
    }
    copyBuffer(srcBuffer: ArrayBufferView, dstBuffer: Buffer): void {
    }
    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void {
    }
    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, viewport: Rect): void {
    }
    bindPipeline(pipeline: Pipeline): void {
    }
    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[] | undefined): void {
    }
    bindInputAssembler(inputAssembler: InputAssembler): void {
    }
    draw(): void {
    }
    endRenderPass(): void {
    }
    end(): void {
    }

}