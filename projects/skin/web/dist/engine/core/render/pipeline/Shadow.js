import { root } from "../scene/Root.js";
import { Cascades } from "./shadow/Cascades.js";
export class Shadow {
    get cascades() {
        return this._cascades;
    }
    get visibleCameras() {
        return this._visibleCameras;
    }
    constructor(_visibilities, cascadeNum) {
        this._visibilities = _visibilities;
        this.cascadeNum = cascadeNum;
        this._cascades = new Map;
        this._visibleCameras = [];
        this._initialized = false;
    }
    update(dumping) {
        if (!this._initialized) {
            const cameras = root.cameras;
            for (let i = 0; i < cameras.length; i++) {
                if (cameras[i].visibilities & this._visibilities) {
                    this._cascades.set(i, new Cascades(cameras[i], this.cascadeNum));
                    this._visibleCameras.push(i);
                }
            }
            this._initialized = true;
        }
        for (let i = 0; i < this._visibleCameras.length; i++) {
            this._cascades.get(this._visibleCameras[i]).update(dumping);
        }
    }
}
