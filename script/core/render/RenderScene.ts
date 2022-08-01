import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";

export default class RenderScene {
    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    update(dt: number) {
        for (let i = 0; i < this._cameras.length; i++) {
            this._cameras[i].update()
        }

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }
    }
}