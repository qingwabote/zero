import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/index.js";
import { Culling } from "../../core/render/pipeline/Culling.js";

export class ViewCulling implements Culling {
    ready(): void { }

    cull(model: Model, cameraIndex: number): boolean {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        return camera.frustum.aabb_out(model.world_bounds)
    }
}