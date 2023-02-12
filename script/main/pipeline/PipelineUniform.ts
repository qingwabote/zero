import { DescriptorSetLayoutBinding } from "../gfx/DescriptorSetLayout.js";

export default interface PipelineUniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding;
    initialize(): void;
    update(): void;
}