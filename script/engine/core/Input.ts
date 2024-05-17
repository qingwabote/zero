import { EventEmitterImpl, EventReceiver } from "bastard";
import { TouchEvent, WheelEvent } from "boot";

enum TouchEvents {
    START = "TOUCH_START",
    MOVE = "TOUCH_MOVE",
    END = "TOUCH_END",
}

enum GestureEvents {
    PINCH = "GESTURE_PINCH",
    ROTATE = "GESTURE_ROTATE"
}

class GestureEvent implements TouchEvent {
    get count(): number {
        return this._event.count;
    }

    get delta(): number {
        return this._delta;
    }

    constructor(private _event: TouchEvent, private _delta: number) { }

    x(index: number): number {
        return this._event.x(index);
    }

    y(index: number): number {
        return this._event.y(index);
    }
}

interface EventToListener {
    [TouchEvents.START]: (event: TouchEvent) => void;
    [TouchEvents.MOVE]: (event: TouchEvent) => void;
    [TouchEvents.END]: (event: TouchEvent) => void;

    [GestureEvents.PINCH]: (event: GestureEvent) => void;
    [GestureEvents.ROTATE]: (event: GestureEvent) => void;
}

interface InputReadonly extends EventReceiver<EventToListener> { }

function distance(event: TouchEvent) {
    const x = event.x(0) - event.x(1);
    const y = event.y(0) - event.y(1);
    return Math.sqrt(x * x + y * y);
}

export class Input extends EventEmitterImpl<EventToListener> implements InputReadonly {
    private _dist: number = 0;

    onTouchStart(event: TouchEvent) {
        if (event.count < 2) {
            this.emit(TouchEvents.START, event);
            return;
        }

        this._dist = distance(event);
    }
    onTouchMove(event: TouchEvent) {
        if (event.count < 2) {
            this.emit(TouchEvents.MOVE, event);
            return;
        }

        const d = distance(event);
        this.emit(GestureEvents.PINCH, new GestureEvent(event, d - this._dist));
        this._dist = d;
    }
    onTouchEnd(event: TouchEvent) {
        this.emit(TouchEvents.END, event);
    }
    onWheel(event: WheelEvent) {
        this.emit(GestureEvents.PINCH, new GestureEvent(event, event.delta));
    }
}
Input.TouchEvents = TouchEvents;
Input.GestureEvents = GestureEvents;

export declare namespace Input {
    export { TouchEvents, GestureEvents, InputReadonly as Readonly, TouchEvent };
    export type { GestureEvent };
}

