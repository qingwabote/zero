import { Buffer } from "./Buffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { Framebuffer } from "./Framebuffer.js";
import { InputAssembler } from "./InputAssembler.js";
import { Pipeline, PipelineLayout } from "./Pipeline.js";
import { RenderPass } from "./RenderPass.js";
import { Texture } from "./Texture.js";
import { Uint32Vector } from "./info.js";

export declare class CommandBuffer {
    private constructor(...args);
    initialize(): boolean;
    begin(): void;
    copyBuffer(srcBuffer: ArrayBuffer, dstBuffer: Buffer, srcOffset: number, length: number): void;
    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void;
    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, x: number, y: number, w: number, h: number): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(compatiblePipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: Uint32Vector): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(vertexCount: number): void;
    drawIndexed(indexCount: number, firstIndex: number): void;
    endRenderPass(): void;
    end(): void;
}