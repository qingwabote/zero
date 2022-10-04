import { Rect } from "../math/rect.js";
import Pipeline, { DescriptorSet, InputAssembler, PipelineLayout } from "./Pipeline.js";

export default interface CommandBuffer {
    initialize(): boolean;
    begin(): void;
    beginRenderPass(viewport: Rect): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[]): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void;
    end(): void;
}