import { EventEmitter } from "bastard";
import { vec2 } from "engine";
var Events;
(function (Events) {
    Events["DIRTY"] = "DIRTY";
    Events["CHANGE"] = "CHANGE";
})(Events || (Events = {}));
export class JoystickInput extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this._point = vec2.create();
    }
    get point() {
        return this._point;
    }
    set point(value) {
        vec2.copy(this._point, value);
        this.emit(Events.DIRTY);
    }
    step(value) {
        vec2.copy(this._point, value);
        this.emit(Events.CHANGE);
    }
}
JoystickInput.Events = Events;
