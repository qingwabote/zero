import EventEmitter from "./utils/EventEmitter.js";

export interface Touch {
    x: number,
    y: number
}

export interface TouchEvent {
    touches: Touch[]
}

export interface InputEventMap {
    TOUCH_START: (event: TouchEvent) => void;
    TOUCH_MOVE: (event: TouchEvent) => void,
    TOUCH_END: (event: TouchEvent) => void,
    GESTURE_PINCH: (delta: number) => void,
    GESTURE_ROTATE: (delta: number) => void,
}

export default class Input extends EventEmitter<InputEventMap> {
}