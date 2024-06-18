import { Zero } from "../../Zero.js";
import { Camera } from "../scene/Camera.js";
import { Cascades } from "./shadow/Cascades.js";

export class Shadow {
    private readonly _camera2cascades: WeakMap<Camera, Cascades> = new Map;

    private readonly _visibleCameras: number[] = [];
    public get visibleCameras(): readonly number[] {
        return this._visibleCameras;
    }

    private _initialized = false;

    constructor(private _visibilities: number, readonly cascadeNum: number) { }

    getCascades(camera: Camera): Cascades | undefined {
        return this._camera2cascades.get(camera);
    }

    update(dumping: boolean) {
        const cameras = Zero.instance.scene.cameras;
        if (!this._initialized) {
            for (let i = 0; i < cameras.length; i++) {
                const camera = cameras[i];
                if (camera.visibilities & this._visibilities) {
                    this._camera2cascades.set(camera, new Cascades(camera, this.cascadeNum));
                    this._visibleCameras.push(i);
                }
            }
            this._initialized = true;
        }
        for (let i = 0; i < this._visibleCameras.length; i++) {
            this._camera2cascades.get(cameras[this._visibleCameras[i]])!.update(dumping);
        }
    }
}