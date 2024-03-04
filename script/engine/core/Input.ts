import { EventEmitterImpl } from "bastard";
import { GestureEvent, TouchEvent } from "boot";

export enum TouchEventName {
    START = "TOUCH_START",
    MOVE = "TOUCH_MOVE",
    END = "TOUCH_END",
    PINCH = "GESTURE_PINCH",
    ROTATE = "GESTURE_ROTATE"
}

interface EventToListener {
    [TouchEventName.START]: (event: TouchEvent) => void;
    [TouchEventName.MOVE]: (event: TouchEvent) => void;
    [TouchEventName.END]: (event: TouchEvent) => void;
    [TouchEventName.PINCH]: (event: GestureEvent) => void;
    [TouchEventName.ROTATE]: (event: GestureEvent) => void;
}

export class Input extends EventEmitterImpl<EventToListener> { }