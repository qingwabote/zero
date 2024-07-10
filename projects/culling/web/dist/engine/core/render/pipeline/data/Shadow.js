import { Zero } from "../../../Zero.js";
import { Cascades } from "./Cascades.js";
export class Shadow {
    getCascades(camera) {
        return this._camera2cascades.get(camera);
    }
    constructor(visibilities, cascadeNum) {
        this.visibilities = visibilities;
        this.cascadeNum = cascadeNum;
        this._camera2cascades = new WeakMap;
    }
    update(dumping) {
        for (const camera of Zero.instance.scene.cameras) {
            if ((camera.visibilities & this.visibilities) == 0) {
                continue;
            }
            let cascades = this._camera2cascades.get(camera);
            if (!cascades) {
                this._camera2cascades.set(camera, cascades = new Cascades(camera, this.cascadeNum));
            }
            cascades.update(dumping);
        }
    }
}
