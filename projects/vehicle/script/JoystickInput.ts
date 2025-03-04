import { EventEmitter } from "bastard";
import { Vec2 } from "engine";

export namespace JoystickInput {
    export enum Events {
        CHANGE = 'CHANGE'
    }

    export interface EventToListener {
        [Events.CHANGE]: () => void;
    }
}

export interface JoystickInput extends EventEmitter<JoystickInput.EventToListener> {
    point: Readonly<Vec2>;
}

