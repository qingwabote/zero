import { EventEmitterImpl } from "bastard";
var Event;
(function (Event) {
    Event["CULL_START"] = "CULL_START";
    Event["CULL_END"] = "CULL_END";
})(Event || (Event = {}));
export class Profile extends EventEmitterImpl {
    constructor() {
        super(...arguments);
        this._draws = 0;
        this._stages = 0;
    }
    get draws() {
        return this._draws;
    }
    set draws(value) {
        this._draws = value;
    }
    get stages() {
        return this._stages;
    }
    set stages(value) {
        this._stages = value;
    }
    clear() {
        this._draws = 0;
        this._stages = 0;
    }
}
Profile.Event = Event;
