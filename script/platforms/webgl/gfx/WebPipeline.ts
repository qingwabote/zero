import Pipeline from "../../../main/core/gfx/Pipeline.js";
import { PipelineInfo } from "../../../main/core/gfx/info.js";

export default class WebPipeline implements Pipeline {
    private _info!: PipelineInfo;
    get info(): PipelineInfo {
        return this._info;
    }

    initialize(info: PipelineInfo): boolean {
        this._info = info;
        return false;
    }
} 