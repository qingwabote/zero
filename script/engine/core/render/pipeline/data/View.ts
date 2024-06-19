import { Scene } from "../../Scene.js";
import { Camera } from "../../scene/Camera.js";
import { Model } from "../../scene/Model.js";
import { Cascades } from "./Cascades.js";

export class View {
    public readonly shadow?: Cascades;

    private _models: Model[] = [];
    public get models(): readonly Model[] {
        return this._models;
    }

    constructor(private readonly _scene: Scene, private readonly _camera: Camera, cascades: number = 0) {
        if (cascades) {
            this.shadow = new Cascades(_camera, cascades);
        }
    }

    update(dumping: boolean) {
        this.shadow?.update(dumping);

        this._models.length = 0;
        this._scene.models.culler()(this._models, this._camera.frustum, this._camera.visibilities);
    }
}