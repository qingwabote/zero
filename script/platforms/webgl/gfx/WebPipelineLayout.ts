import DescriptorSetLayout from "../../../main/gfx/DescriptorSetLayout.js";
import { PipelineLayout } from "../../../main/gfx/Pipeline.js";

export default class WebPipelineLayout implements PipelineLayout {
    initialize(setLayouts: DescriptorSetLayout[]): boolean {
        return false;
    }

}