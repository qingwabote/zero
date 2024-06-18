import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culler } from "../../core/render/pipeline/Culling.js";
import { Frustum } from "../../core/render/scene/Frustum.js";
import { ModelCollection } from "../../core/render/scene/ModelCollection.js";

export class CSMCuller implements Culler {
    private _cull!: (results: Model[], frustum: Readonly<Frustum>, visibilities: number, type: string,) => void;

    cull(results: Model[], models: ModelCollection.Readonly, type: string, cameraIndex: number): void {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._cull = models.culler(4)
        }
        const camera = Zero.instance.scene.cameras[cameraIndex];
        const frustum = data.shadow!.getCascades(camera)!.boundaries[data.flowLoopIndex];
        this._cull(results, frustum, camera.visibilities, type)
    }
}