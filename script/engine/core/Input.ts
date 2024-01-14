import { EventEmitterImpl } from "bastard";
import { GestureEvent, TouchEvent } from "boot";

export enum InputEventType {
    TOUCH_START = "TOUCH_START",
    TOUCH_MOVE = "TOUCH_MOVE",
    TOUCH_END = "TOUCH_END",
    GESTURE_PINCH = "GESTURE_PINCH",
    GESTURE_ROTATE = "GESTURE_ROTATE"
}

interface EventToListener {
    [InputEventType.TOUCH_START]: (event: TouchEvent) => void;
    [InputEventType.TOUCH_MOVE]: (event: TouchEvent) => void;
    [InputEventType.TOUCH_END]: (event: TouchEvent) => void;
    [InputEventType.GESTURE_PINCH]: (event: GestureEvent) => void;
    [InputEventType.GESTURE_ROTATE]: (event: GestureEvent) => void;
}

export class Input extends EventEmitterImpl<EventToListener> { }