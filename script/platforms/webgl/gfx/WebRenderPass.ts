import RenderPass, { RenderPassInfo } from "../../../core/gfx/RenderPass.js";

export default class WebRenderPass implements RenderPass {
    private _info!: RenderPassInfo;
    get info(): RenderPassInfo {
        return this._info;
    }

    initialize(info: RenderPassInfo): boolean {
        this._info = info;
        return false;
    }

}