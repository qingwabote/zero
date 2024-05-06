import { Model } from "./Model.js";
export class Scene {
    get cameras() {
        return this._cameras;
    }
    get models() {
        return this._models;
    }
    set models(value) {
        this._models = value;
        this._models_invalidated = true;
    }
    constructor(_models) {
        this._models = _models;
        this.directionalLight = undefined;
        this._cameras = [];
        this._models_invalidated = true;
    }
    addCamera(camera) {
        this._cameras.push(camera);
    }
    addModel(model) {
        this._models.add(model);
    }
    update() {
        var _a;
        (_a = this.directionalLight) === null || _a === void 0 ? void 0 : _a.update();
        for (const camera of this._cameras) {
            camera.update();
        }
        for (const model of this._models) {
            model.update();
            if (this._models_invalidated || (model.hasChanged & Model.ChangeBits.BOUNDS)) {
                this._models.update(model);
            }
        }
        this._models_invalidated = false;
    }
}
