import { DescriptorSetLayoutInfo } from "./info.js";

export declare class DescriptorSetLayout {
    get info(): DescriptorSetLayoutInfo;
    private constructor(...args);
    initialize(info: DescriptorSetLayoutInfo): boolean;
}