import { PipelineLayout } from "../../../main/core/gfx/Pipeline.js";
import { PipelineLayoutInfo } from "../../../main/core/gfx/info.js";

export default class WebPipelineLayout implements PipelineLayout {
    initialize(info: PipelineLayoutInfo): boolean { return false; }
}