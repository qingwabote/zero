import { Zero } from "../../core/Zero.js";
export class CSMCulling {
    cull(model, cameraIndex) {
        const data = Zero.instance.pipeline.data;
        const frustum = data.shadow.cascades[cameraIndex].bounds[data.flowLoopIndex];
        return !frustum.aabb(model.world_bounds);
    }
}
