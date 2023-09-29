import { PipelineInfo } from './info.js';

export class Pipeline {
    private _info!: PipelineInfo;
    get info(): PipelineInfo {
        return this._info;
    }

    initialize(info: PipelineInfo): boolean {
        this._info = info;
        return false;
    }
} 