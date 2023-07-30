import { EventEmitterImpl } from "../base/EventEmitterImpl.js";

export interface Touch {
    readonly x: number,
    readonly y: number
}

export interface TouchEvent {
    readonly touches: readonly Touch[]
}

export interface GestureEvent {
    readonly delta: number
}

export enum InputEvent {
    TOUCH_START = "TOUCH_START",
    TOUCH_MOVE = "TOUCH_MOVE",
    TOUCH_END = "TOUCH_END",
    GESTURE_PINCH = "GESTURE_PINCH",
    GESTURE_ROTATE = "GESTURE_ROTATE"
}

interface EventToListener {
    [InputEvent.TOUCH_START]: (event: TouchEvent) => void;
    [InputEvent.TOUCH_MOVE]: (event: TouchEvent) => void;
    [InputEvent.TOUCH_END]: (event: TouchEvent) => void;
    [InputEvent.GESTURE_PINCH]: (event: GestureEvent) => void;
    [InputEvent.GESTURE_ROTATE]: (event: GestureEvent) => void;
}

export class Input extends EventEmitterImpl<EventToListener> { }