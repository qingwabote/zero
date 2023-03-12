import Camera from "./Camera.js";
import DirectionalLight from "./DirectionalLight.js";
import Model from "./Model.js";

export default class Root {
    directionalLight?: DirectionalLight;

    private _cameras: Camera[] = [];
    get cameras(): Camera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }
}