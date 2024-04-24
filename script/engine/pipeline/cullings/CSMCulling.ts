import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";

export class CSMCulling implements Culling {
    private readonly _claimed: Map<Model, Model> = new Map;

    ready(): void {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._claimed.clear();
        }
    }

    cull(model: Model, cameraIndex: number): boolean {
        if (this._claimed.has(model)) {
            return true;
        }

        const data = Zero.instance.pipeline.data;
        const frustum = data.shadow.cascades[cameraIndex].bounds[data.flowLoopIndex];
        if (frustum.aabb_out(model.world_bounds)) {
            return true;
        }

        if (frustum.aabb_in(model.world_bounds)) {
            this._claimed.set(model, model);
        }

        return false;
    }
}