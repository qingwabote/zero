import { Zero } from "../../core/Zero.js";
export class CSMCulling {
    cull(models, type, cameraIndex) {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._cull = models.cull(4);
        }
        const frustum = data.shadow.cascades.get(cameraIndex).bounds[data.flowLoopIndex];
        return this._cull(frustum, Zero.instance.scene.cameras[cameraIndex].visibilities, type);
    }
}
