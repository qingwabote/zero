import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";

export default class RenderScene {
    directionalLight!: RenderDirectionalLight;

    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }
}