import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";

export class ShadowCulling implements Culling {
    cull(model: Model, cameraIndex: number): boolean {
        const frustum = Zero.instance.scene.directionalLight!.shadows[cameraIndex].frustum;
        return !frustum.aabb(model.world_bounds);
    }
}