import { EventEmitterImpl } from "bastard";
import { Zero } from "../../Zero.js";
import { Camera } from "../scene/Camera.js";
import { Model } from "../scene/Model.js";
import { Shadow } from "./Shadow.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class Data extends EventEmitterImpl<EventToListener> {
    static readonly Event = Event;

    shadow: Shadow | null = null;

    private _camera2models: WeakMap<Camera, Model[]> = new WeakMap;

    flowLoopIndex = 0;

    getModels(camera: Camera): readonly Model[] | undefined {
        return this._camera2models.get(camera)
    }

    update(dumping: boolean) {
        this.shadow?.update(dumping);

        for (let i = 0; i < Zero.instance.scene.cameras.length; i++) {
            const camera = Zero.instance.scene.cameras[i];
            let models: Model[] | undefined = this._camera2models.get(camera);
            if (!models) {
                this._camera2models.set(camera, models = []);
            }
            models.length = 0;
            Zero.instance.scene.models.culler()(models, camera.frustum, camera.visibilities);
        }

        this.emit(Event.UPDATE);
    }
}