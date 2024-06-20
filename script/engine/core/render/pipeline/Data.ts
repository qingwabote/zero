import { EventEmitter } from "bastard";
import { Zero } from "../../Zero.js";
import { Camera } from "../scene/Camera.js";
import { View } from "./data/View.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class Data extends EventEmitter.Impl<EventToListener> {
    static readonly Event = Event;

    public shadow_visibilities: number = 0;

    public shadow_cascades: number = 0;

    private _camera2view: WeakMap<Camera, View> = new WeakMap;

    cameraIndex = 0;

    flowLoopIndex = 0;

    get camera(): Camera {
        return Zero.instance.scene.cameras[this.cameraIndex];
    }

    get view(): View {
        return this._camera2view.get(this.camera)!
    }

    getView(camera: Camera): View {
        return this._camera2view.get(camera)!
    }

    update(dumping: boolean) {
        const scene = Zero.instance.scene;
        for (const camera of scene.cameras) {
            let view = this._camera2view.get(camera);
            if (!view) {
                this._camera2view.set(camera, view = new View(scene, camera, camera.visibilities & this.shadow_visibilities ? this.shadow_cascades : 0))
            }
            view.update(dumping);
        }

        this.emit(Event.UPDATE);
    }
}