import { EventEmitter } from "bastard";
import { vec2 } from "engine";
import { JoystickInput } from "./JoystickInput.js";
export class JoystickInputLocal extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this._changed = false;
        this._point = vec2.create();
    }
    get point() {
        return this._point;
    }
    set point(value) {
        vec2.copy(this._point, value);
        this._changed = true;
    }
    step() {
        if (!this._changed) {
            return;
        }
        this.emit(JoystickInput.Events.CHANGE);
        this._changed = false;
    }
}
