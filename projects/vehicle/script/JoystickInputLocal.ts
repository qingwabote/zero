import { EventEmitter } from "bastard";
import { vec2, Vec2 } from "engine";
import { JoystickInput } from "./JoystickInput.js";

export class JoystickInputLocal extends EventEmitter.Impl<JoystickInput.EventToListener> implements JoystickInput {
    private _changed = false;

    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }
    set point(value: Readonly<Vec2>) {
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