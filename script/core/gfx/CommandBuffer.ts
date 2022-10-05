import { Rect } from "../math/rect.js";
import Pipeline, { DescriptorSet, InputAssembler, PipelineLayout } from "./Pipeline.js";
import Texture from "./Texture.js";

export default interface CommandBuffer {
    initialize(): boolean;
    begin(): void;
    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void;
    beginRenderPass(viewport: Rect): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[]): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void;
    end(): void;
}