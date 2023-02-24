import DescriptorSetLayout from "../../../main/core/gfx/DescriptorSetLayout.js";
import { PipelineLayout } from "../../../main/core/gfx/Pipeline.js";

export default class WebPipelineLayout implements PipelineLayout {
    initialize(setLayouts: DescriptorSetLayout[]): boolean {
        return false;
    }

}