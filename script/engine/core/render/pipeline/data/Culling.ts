import { Zero } from "../../../Zero.js";
import { Camera } from "../../scene/Camera.js";
import { Shadow } from "./Shadow.js";
import { View } from "./View.js";

export class Culling {
    private _camera2view: WeakMap<Camera, View> = new WeakMap;

    getView(camera: Camera): View {
        return this._camera2view.get(camera)!
    }

    update(shadow: Shadow | null) {
        const scene = Zero.instance.scene;
        for (const camera of scene.cameras) {
            let view = this._camera2view.get(camera);
            if (!view) {
                this._camera2view.set(camera, view = new View(scene, camera, shadow?.getCascades(camera)))
            }
            view.cull();
        }
    }
}