import { EventEmitter } from "bastard";
import { Vec2, vec2 } from "engine";
import { JoystickInput } from "./JoystickInput.js";

export class JoystickInputRemote extends EventEmitter.Impl<JoystickInput.EventToListener> implements JoystickInput {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }
    set point(value: Readonly<Vec2>) { }

    constructor() {
        super();


    }
}