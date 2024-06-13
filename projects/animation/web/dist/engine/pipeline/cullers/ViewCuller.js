import { Zero } from "../../core/Zero.js";
export class ViewCuller {
    cull(models, type, cameraIndex) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        return models.culler()(camera.frustum, camera.visibilities, type);
    }
}
