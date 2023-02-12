import Pipeline, { PipelineInfo } from "../../../main/gfx/Pipeline.js";

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