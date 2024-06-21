import { Zero } from "../../../Zero.js";
import { Camera } from "../../scene/Camera.js";
import { Cascades } from "./Cascades.js";

export class Shadow {
    private _camera2cascades: WeakMap<Camera, Cascades> = new WeakMap;

    getCascades(camera: Camera): Cascades | undefined {
        return this._camera2cascades.get(camera);
    }

    constructor(public readonly visibilities: number, public readonly cascadeNum: number) { }

    update(dumping: boolean) {
        for (const camera of Zero.instance.scene.cameras) {
            if ((camera.visibilities & this.visibilities) == 0) {
                continue;
            }

            let cascades = this._camera2cascades.get(camera);
            if (!cascades) {
                this._camera2cascades.set(camera, cascades = new Cascades(camera, this.cascadeNum))
            }
            cascades.update(dumping);
        }
    }
}