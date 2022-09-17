import { Rect } from "../math/rect.js";
import Pipeline, { DescriptorSet, InputAssembler, PipelineLayout } from "./Pipeline.js";

export default interface CommandBuffer {
    begin(): void;
    beginRenderPass(viewport: Rect): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void
}