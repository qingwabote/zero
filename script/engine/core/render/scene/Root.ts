import { Camera } from "./Camera.js";
import { DirectionalLight } from "./DirectionalLight.js";
import { Model } from "./Model.js";
import { ModelCollection, ModelCollectionReadonly } from "./ModelCollection.js";

export class Root {
    directionalLight?: DirectionalLight = undefined;

    private _cameras: Camera[] = [];
    get cameras(): readonly Camera[] {
        return this._cameras;
    }

    private _models_invalidated = true;
    public get models(): ModelCollectionReadonly {
        return this._models;
    }
    public set models(value: ModelCollection) {
        this._models = value;
        this._models_invalidated = true;
    }

    constructor(private _models: ModelCollection) { }

    addCamera(camera: Camera) {
        this._cameras.push(camera);
    }

    addModel(model: Model) {
        this._models.add(model);
    }

    update() {
        this.directionalLight?.update();

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