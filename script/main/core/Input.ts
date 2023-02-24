import EventEmitter from "../base/EventEmitter.js";

export interface Touch {
    x: number,
    y: number
}

export interface TouchEvent {
    touches: Touch[]
}

export interface GestureEvent {
    delta: number
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

export default class Input extends EventEmitter<EventToListener> { }