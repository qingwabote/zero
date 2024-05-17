import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";
import { ModelCollection } from "../../core/render/scene/ModelCollection.js";

export class NoneCulling implements Culling {
    cull(models: ModelCollection.Readonly, type: string, cameraIndex: number): Model[] {
        const results: Model[] = [];
        const camera = Zero.instance.scene.cameras[cameraIndex];
        for (const model of models) {
            if (model.type != type) {
                continue;
            }

            if ((camera.visibilities & model.transform.visibility) == 0) {
                continue;
            }

            results.push(model)
        }
        return results;
    }
}