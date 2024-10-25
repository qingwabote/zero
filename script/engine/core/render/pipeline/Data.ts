import { EventEmitter } from "bastard";
import { Zero } from "../../Zero.js";
import { Camera } from "../scene/Camera.js";
import { Profile } from "./Profile.js";
import { Culling } from "./data/Culling.js";
import { Shadow } from "./data/Shadow.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class Data extends EventEmitter.Impl<EventToListener> {
    static readonly Event = Event;

    public shadow: Shadow | null = null;

    public culling: Culling | null = new Culling;

    cameraIndex = 0;

    get current_camera(): Camera {
        return Zero.instance.scene.cameras[this.cameraIndex];
    }

    update(profile: Profile, dumping: boolean) {
        this.shadow?.update(dumping);

        profile.emit(Profile.Event.CULL_START);
        this.culling?.update(this.shadow)
        profile.emit(Profile.Event.CULL_END);

        this.emit(Event.UPDATE);
    }
}