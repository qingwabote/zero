import { RenderPassInfo } from './info.js';

export class RenderPass {
    private _info!: RenderPassInfo;
    get info(): RenderPassInfo {
        return this._info;
    }

    initialize(info: RenderPassInfo): boolean {
        this._info = info;
        return false;
    }

}