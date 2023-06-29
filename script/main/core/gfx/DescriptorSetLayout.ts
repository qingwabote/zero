import DescriptorSet from "./DescriptorSet.js";
import { ShaderStageFlagBits } from "./info.js";

// copy values from VkDescriptorType in vulkan_core.h
export enum DescriptorType {
    SAMPLER_TEXTURE = 1,
    UNIFORM_BUFFER = 6,
    UNIFORM_BUFFER_DYNAMIC = 8,
}

export interface DescriptorSetLayoutBinding {
    readonly binding: number;
    readonly descriptorType: DescriptorType;
    readonly descriptorCount: number;
    readonly stageFlags: ShaderStageFlagBits;
}

export default interface DescriptorSetLayout {
    get bindings(): readonly DescriptorSetLayoutBinding[];
    initialize(bindings: DescriptorSetLayoutBinding[]): boolean;
    createDescriptorSet(): DescriptorSet;
}