import { DescriptorSetLayoutInfo } from "./info.js";

export default interface DescriptorSetLayout {
    get info(): DescriptorSetLayoutInfo;
    initialize(info: DescriptorSetLayoutInfo): boolean;
}