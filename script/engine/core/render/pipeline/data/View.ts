import { Scene } from "../../Scene.js";
import { Camera } from "../../scene/Camera.js";
import { Model } from "../../scene/Model.js";
import { Cascades } from "./Cascades.js";

export class View {
    private _modelsInCamera: Model[] = [];
    public get camera(): readonly Model[] {
        return this._modelsInCamera;
    }

    private _modelsInCascades: Model[][];
    public get shadow(): readonly (readonly Model[])[] {
        return this._modelsInCascades;
    }

    constructor(private readonly _scene: Scene, private readonly _camera: Camera, private readonly _shadow: Cascades | null = null) {
        const modelsInCascades: Model[][] = [];
        if (_shadow) {
            for (let i = 0; i < _shadow.num; i++) {
                modelsInCascades.push([])
            }
        }
        this._modelsInCascades = modelsInCascades;
    }

    cull() {
        if (this._shadow) {
            const cull = this._scene.models.culler(this._shadow.num)
            for (let i = 0; i < this._shadow.num; i++) {
                this._modelsInCascades[i].length = 0;
                cull(this._modelsInCascades[i], this._shadow.boundaries[i], this._camera.visibilities);
            }
        }

        this._modelsInCamera.length = 0;
        this._scene.models.culler()(this._modelsInCamera, this._camera.frustum, this._camera.visibilities);
    }
}