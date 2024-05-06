import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";
import { ModelCollectionReadonly } from "../../core/render/scene/ModelCollection.js";

export class ViewCulling implements Culling {
    cull(models: ModelCollectionReadonly, type: string, cameraIndex: number): Model[] {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        return models.cull()(camera.frustum, camera.visibilities, type);
    }
}