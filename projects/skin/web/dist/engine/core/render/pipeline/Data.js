import { EventEmitter } from "bastard";
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
    }
    update(profile, dumping) {
        var _a, _b;
        (_a = this.shadow) === null || _a === void 0 ? void 0 : _a.update(dumping);
        profile.emit(Profile.Event.CULL_START);
        (_b = this.culling) === null || _b === void 0 ? void 0 : _b.update(this.shadow);
        profile.emit(Profile.Event.CULL_END);
        this.emit(Event.UPDATE);
    }
}
Data.Event = Event;
