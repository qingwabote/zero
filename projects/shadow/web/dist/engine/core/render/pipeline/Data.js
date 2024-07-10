import { EventEmitter } from "bastard";
import { Zero } from "../../Zero.js";
import { Profile } from "./Profile.js";
import { Culling } from "./data/Culling.js";
var Event;
(function (Event) {
    Event["UPDATE"] = "UPDATE";
})(Event || (Event = {}));
export class Data extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this.shadow = null;
        this.culling = new Culling;
        this.cameraIndex = 0;
        this.flowLoopIndex = 0;
    }
    get current_camera() {
        return Zero.instance.scene.cameras[this.cameraIndex];
    }
    update(profile, dumping) {
        var _a, _b;
        (_a = this.shadow) === null || _a === void 0 ? void 0 : _a.update(dumping);
        profile.emit(Profile.Event.CULL_START);
        (_b = this.culling) === null || _b === void 0 ? void 0 : _b.cull(this.shadow);
        profile.emit(Profile.Event.CULL_END);
        this.emit(Event.UPDATE);
    }
}
Data.Event = Event;
