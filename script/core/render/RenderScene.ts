import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import { RenderNode } from "./RenderNode.js";

type RenderObject = RenderNode | RenderCamera | RenderDirectionalLight;

export default class RenderScene {
    private _directionalLight!: RenderDirectionalLight;
    get directionalLight(): RenderDirectionalLight {
        return this._directionalLight;
    }
    set directionalLight(value: RenderDirectionalLight) {
        this._directionalLight = value;
        this._dirtyObjects.set(value, value);
    }

    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    private _dirtyObjects: Map<RenderObject, RenderObject> = new Map;
    get dirtyObjects(): Map<RenderObject, RenderObject> {
        return this._dirtyObjects;
    }

    update(dt: number) {
        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }
    }
}