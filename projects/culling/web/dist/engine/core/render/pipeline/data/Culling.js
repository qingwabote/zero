import { Zero } from "../../../Zero.js";
import { View } from "./View.js";
export class Culling {
    constructor() {
        this._camera2view = new WeakMap;
    }
    getView(camera) {
        return this._camera2view.get(camera);
    }
    cull(shadow) {
        const scene = Zero.instance.scene;
        for (const camera of scene.cameras) {
            let view = this._camera2view.get(camera);
            if (!view) {
                this._camera2view.set(camera, view = new View(scene, camera, shadow === null || shadow === void 0 ? void 0 : shadow.getCascades(camera)));
            }
            view.cull();
        }
    }
}
