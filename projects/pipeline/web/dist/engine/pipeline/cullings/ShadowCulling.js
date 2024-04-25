import { Zero } from "../../core/Zero.js";
export class ShadowCulling {
    cull(model, cameraIndex) {
        const frustum = Zero.instance.pipeline.data.shadow.boundingFrusta[cameraIndex].bounds;
        return !frustum.aabb(model.world_bounds);
    }
}
