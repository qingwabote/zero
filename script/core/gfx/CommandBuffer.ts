import { InputAssembler } from "./InputAssembler.js";
import Pipeline, { DescriptorSet } from "./Pipeline.js";

export default interface CommandBuffer {
    beginRenderPass(): void;
    bindPipeline(pipeline: Pipeline): void;
    bindDescriptorSet(index: number, descriptorSet: DescriptorSet): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void
}