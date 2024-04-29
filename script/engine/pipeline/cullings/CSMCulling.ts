import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";
import { Frustum } from "../../core/render/scene/Frustum.js";
import { ModelCollectionReadonly } from "../../core/render/scene/ModelCollection.js";

export class CSMCulling implements Culling {
    private _cull!: (type: string, visibilities: number, frustum: Readonly<Frustum>) => Model[];

    cull(models: ModelCollectionReadonly, type: string, cameraIndex: number): Model[] {
        const data = Zero.instance.pipeline.data;
        if (data.flowLoopIndex == 0) {
            this._cull = models.cull(4)
        }
        const frustum = data.shadow!.cascades.get(cameraIndex)!.bounds[data.flowLoopIndex];
        return this._cull(type, Zero.instance.scene.cameras[cameraIndex].visibilities, frustum)
    }
}