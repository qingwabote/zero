import { EventEmitter } from "bastard";
import { vec2 } from "engine";
export class JoystickInputRemote extends EventEmitter.Impl {
    get point() {
        return this._point;
    }
    set point(value) { }
    constructor() {
        super();
        this._point = vec2.create();
    }
}
