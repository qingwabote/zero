import { Zero } from "../../core/Zero.js";
export class ViewCulling {
    cull(models, type, cameraIndex) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        return models.cull()(camera.frustum, camera.visibilities, type);
    }
}
