import { DescriptorSet } from "./DescriptorSet.js";
import { Framebuffer } from "./Framebuffer.js";
import { InputAssembler } from "./InputAssembler.js";
import { Pipeline } from "./Pipeline.js";
import { RenderPass } from "./RenderPass.js";
import { Texture } from "./Texture.js";
import { Uint32Vector } from "./info.js";

export declare class CommandBuffer {
    private constructor(...args);
    begin(): void;
    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void;
    copyBufferToTexture(buffer: ArrayBufferView, texture: Texture, offset_x: number, offset_y: number, extent_x: number, extent_y: number): void;
    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, x: number, y: number, w: number, h: number): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(index: number, descriptorSet: DescriptorSet, dynamicOffsets?: Uint32Vector): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(vertexCount: number, firstVertex: number, instanceCount: number): void;
    drawIndexed(indexCount: number, firstIndex: number, instanceCount: number): void;
    endRenderPass(): void;
    end(): void;
}