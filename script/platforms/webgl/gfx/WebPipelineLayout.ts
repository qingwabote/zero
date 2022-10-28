import { DescriptorSetLayout, PipelineLayout } from "../../../core/gfx/Pipeline.js";

export default class WebPipelineLayout implements PipelineLayout {
    initialize(setLayouts: DescriptorSetLayout[]): boolean {
        return false;
    }

}