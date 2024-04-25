import { Zero } from "../../core/Zero.js";
export class ViewCulling {
    ready() { }
    cull(model, cameraIndex) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        return camera.frustum.aabb_out(model.world_bounds);
    }
}
