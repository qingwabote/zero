import { EventEmitterImpl } from "bastard";
import { Camera } from "./Camera.js";
import { DirectionalLight } from "./DirectionalLight.js";
import { Model } from "./Model.js";

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

enum Event {
    CAMERA_ADD = 'CAMERA_ADD'
}

interface EventToListener {
    [Event.CAMERA_ADD]: () => void;
}

export class Root extends EventEmitterImpl<EventToListener> {
    static readonly Event = Event;

    directionalLight?: DirectionalLight = undefined;

    private _cameras: Camera[] = [];
    get cameras(): readonly Camera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): readonly Model[] {
        return this._models;
    }

    addCamera(camera: Camera) {
        this._cameras.push(camera);
        this.emit(Event.CAMERA_ADD);
    }

    addModel(model: Model) {
        this._models.push(model);
        model.onAddToScene();
    }

    update() {
        this.directionalLight?.update();

        for (const camera of this._cameras) {
            camera.update();
        }

        this._models.sort(modelCompareFn);
        for (const model of this._models) {
            model.update();
        }
    }
}

export const root = new Root;