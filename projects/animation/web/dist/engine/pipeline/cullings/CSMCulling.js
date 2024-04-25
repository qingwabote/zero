import { Zero } from "../../core/Zero.js";
export class CSMCulling {
    constructor() {
        this._claimed = new Map;
    }
    ready() {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._claimed.clear();
        }
    }
    cull(model, cameraIndex) {
        if (this._claimed.has(model)) {
            return true;
        }
        const data = Zero.instance.pipeline.data;
        const frustum = data.shadow.cascades.get(cameraIndex).bounds[data.flowLoopIndex];
        if (frustum.aabb_out(model.world_bounds)) {
            return true;
        }
        if (frustum.aabb_in(model.world_bounds)) {
            this._claimed.set(model, model);
        }
        return false;
    }
}
