import { EventEmitterImpl } from "bastard";
import { GestureEvent, TouchEvent } from "boot";

export enum TouchEventName {
    START = "TOUCH_START",
    MOVE = "TOUCH_MOVE",
    END = "TOUCH_END",
}

export enum GestureEventName {
    PINCH = "GESTURE_PINCH",
    ROTATE = "GESTURE_ROTATE"
}

interface EventToListener {
    [TouchEventName.START]: (event: TouchEvent) => void;
    [TouchEventName.MOVE]: (event: TouchEvent) => void;
    [TouchEventName.END]: (event: TouchEvent) => void;
    [GestureEventName.PINCH]: (event: GestureEvent) => void;
    [GestureEventName.ROTATE]: (event: GestureEvent) => void;
}

export class Input extends EventEmitterImpl<EventToListener> { }