import EventEmitter from "./base/EventEmitter.js";

export interface Touch {
    x: number,
    y: number
}

export interface TouchEvent {
    touches: Touch[]
}

enum Event {
    TOUCH_START = "TOUCH_START",
    TOUCH_MOVE = "TOUCH_MOVE",
    TOUCH_END = "TOUCH_END",
    GESTURE_PINCH = "GESTURE_PINCH",
    GESTURE_ROTATE = "GESTURE_ROTATE"
}

interface EventToListener {
    [Event.TOUCH_START]: (event: TouchEvent) => void;
    [Event.TOUCH_MOVE]: (event: TouchEvent) => void;
    [Event.TOUCH_END]: (event: TouchEvent) => void;
    [Event.GESTURE_PINCH]: (delta: number) => void;
    [Event.GESTURE_ROTATE]: (delta: number) => void;
}

export default class Input extends EventEmitter<EventToListener> {
    static Event = Event;
}