import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";

export class ShadowCulling implements Culling {
    cull(model: Model, cameraIndex: number): boolean {
        const frustum = Zero.instance.pipeline.data.shadow.boundingFrusta[cameraIndex].levels[0].bounds;
        return !frustum.aabb(model.world_bounds);
    }
}