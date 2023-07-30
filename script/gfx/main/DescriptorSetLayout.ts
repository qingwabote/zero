import { DescriptorSetLayoutInfo } from "./info.js";

export interface DescriptorSetLayout {
    get info(): DescriptorSetLayoutInfo;
    initialize(info: DescriptorSetLayoutInfo): boolean;
}