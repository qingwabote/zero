import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culler } from "../../core/render/pipeline/Culling.js";
import { Frustum } from "../../core/render/scene/Frustum.js";
import { ModelCollection } from "../../core/render/scene/ModelCollection.js";

export class CSMCuller implements Culler {
    private _cull!: (frustum: Readonly<Frustum>, visibilities: number, type: string,) => Model[];

    cull(models: ModelCollection.Readonly, type: string, cameraIndex: number): Model[] {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._cull = models.culler(4)
        }
        const frustum = data.shadow!.cascades.get(cameraIndex)!.bounds[data.flowLoopIndex];
        return this._cull(frustum, Zero.instance.scene.cameras[cameraIndex].visibilities, type)
    }
}