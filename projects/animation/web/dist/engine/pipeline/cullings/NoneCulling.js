import { Zero } from "../../core/Zero.js";
export class NoneCulling {
    cull(models, type, cameraIndex) {
        const results = [];
        const camera = Zero.instance.scene.cameras[cameraIndex];
        for (const model of models) {
            if (model.type != type) {
                continue;
            }
            if ((camera.visibilities & model.transform.visibility) == 0) {
                continue;
            }
            results.push(model);
        }
        return results;
    }
}
