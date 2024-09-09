import { EventEmitter } from "bastard";
import { Camera } from "./scene/Camera.js";
import { DirectionalLight } from "./scene/DirectionalLight.js";
import { Model } from "./scene/Model.js";
import { ModelCollection } from "./scene/ModelCollection.js";

enum Event {
    MODEL_UPDATE_START = 'MODEL_UPDATE_START',
    MODEL_UPDATE_END = 'MODEL_UPDATE_END'
}

interface Event2Listener {
    [Event.MODEL_UPDATE_START]: () => void;
    [Event.MODEL_UPDATE_END]: () => void;
}

export class Scene {
    static readonly Event = Event;

    private _event = new EventEmitter.Impl<Event2Listener>;
    public get event(): EventEmitter.Readonly<Event2Listener> {
        return this._event;
    }

    directionalLight?: DirectionalLight = undefined;

    private _cameras: Camera[] = [];
    get cameras(): readonly Camera[] {
        return this._cameras;
    }

    private _models_invalidated = true;
    public get models(): ModelCollection.Readonly {
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

        this._event.emit(Event.MODEL_UPDATE_START)
        for (const model of this._models) {
            model.updateBounds();

            if (this._models_invalidated || (model.hasChanged & Model.ChangeBits.BOUNDS)) {
                this._models.update(model);
            }
        }
        this._event.emit(Event.MODEL_UPDATE_END)

        this._models_invalidated = false;
    }
}