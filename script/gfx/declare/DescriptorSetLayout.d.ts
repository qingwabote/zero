import { DescriptorSetLayoutInfo } from "./info.js";

export declare class DescriptorSetLayout {
    get info(): DescriptorSetLayoutInfo;
    initialize(info: DescriptorSetLayoutInfo): boolean;
}