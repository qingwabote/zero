import { Camera } from "./Camera.js";
import { DirectionalLight } from "./DirectionalLight.js";
import { Model } from "./Model.js";

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

export class Root {
    directionalLight?: DirectionalLight = undefined;

    private _cameras: Camera[] = [];
    get cameras(): Camera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): readonly Model[] {
        return this._models;
    }

    addModel(model: Model) {
        this._models.push(model);
        model.onAddToScene();
    }

    update() {
        this._models.sort(modelCompareFn);
        for (const model of this._models) {
            model.update();
        }
    }
}