import { EventEmitter } from "bastard";
var Event;
(function (Event) {
    Event["CULL_START"] = "CULL_START";
    Event["CULL_END"] = "CULL_END";
})(Event || (Event = {}));
export class Profile extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this.passes = 0;
        this.draws = 0;
        this.stages = 0;
    }
    clear() {
        this.passes = 0;
        this.draws = 0;
        this.stages = 0;
    }
}
Profile.Event = Event;
