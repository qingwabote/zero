import { DescriptorSetLayoutBinding } from "../gfx/DescriptorSetLayout.js";

export default interface Uniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding;
    initialize(): void;
    update(): void;
}