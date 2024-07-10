import { EventEmitter } from "bastard";
import { Model } from "./scene/Model.js";
var Event;
(function (Event) {
    Event["MODEL_UPDATE_START"] = "MODEL_UPDATE_START";
    Event["MODEL_UPDATE_END"] = "MODEL_UPDATE_END";
})(Event || (Event = {}));
export class Scene {
    get event() {
        return this._event;
    }
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
        this._event = new EventEmitter.Impl;
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
        this._event.emit(Event.MODEL_UPDATE_START);
        for (const model of this._models) {
            model.update();
            if (this._models_invalidated || (model.hasChanged & Model.ChangeBits.BOUNDS)) {
                this._models.update(model);
            }
        }
        this._event.emit(Event.MODEL_UPDATE_END);
        this._models_invalidated = false;
    }
}
Scene.Event = Event;
