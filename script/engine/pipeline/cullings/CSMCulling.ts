import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";

export class CSMCulling implements Culling {
    cull(model: Model, cameraIndex: number): boolean {
        const data = Zero.instance.pipeline.data;
        const frustum = data.shadow.cascades[cameraIndex].bounds[data.flowLoopIndex];
        return !frustum.aabb(model.world_bounds);
    }
}