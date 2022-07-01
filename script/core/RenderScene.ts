import Model from "./Model.js";

export default class RenderScene {
    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    tick(dt: number) { }
}