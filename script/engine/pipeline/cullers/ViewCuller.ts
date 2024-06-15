import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culler } from "../../core/render/pipeline/Culling.js";
import { ModelCollection } from "../../core/render/scene/ModelCollection.js";

export class ViewCuller implements Culler {
    cull(results: Model[], models: ModelCollection.Readonly, type: string, cameraIndex: number): void {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        models.culler()(results, camera.frustum, camera.visibilities, type);
    }
}