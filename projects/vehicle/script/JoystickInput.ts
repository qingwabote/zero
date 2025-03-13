import { EventEmitter } from "bastard";
import { vec2, Vec2 } from "engine";

enum Events {
    DIRTY = 'DIRTY',
    CHANGE = 'CHANGE'
}

interface EventToListener {
    [Events.DIRTY]: () => void;
    [Events.CHANGE]: () => void;
}

export class JoystickInput extends EventEmitter.Impl<EventToListener> {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }
    set point(value: Readonly<Vec2>) {
        vec2.copy(this._point, value);
        this.emit(Events.DIRTY);
    }

    step(value: Readonly<Vec2>) {
        vec2.copy(this._point, value);
        this.emit(Events.CHANGE);
    }
}
JoystickInput.Events = Events;

export declare namespace JoystickInput {
    export { Events, EventToListener }
}

