import { DescriptorSet, DescriptorSetLayout } from "gfx";
import { BufferView } from "./BufferView.js";

export interface UniformSource {
    getDescriptorSetLayout(): DescriptorSetLayout | null;

    createUniformBuffers(descriptorSet: DescriptorSet): BufferView[]

    fillBuffers(buffers: BufferView[]): void;

    bindTextures?(descriptorSet: DescriptorSet): void;
}