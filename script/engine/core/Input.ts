import { EventEmitterImpl, EventReceiver } from "bastard";
import { TouchEvent, WheelEvent } from "boot";

export enum TouchEventName {
    START = "TOUCH_START",
    MOVE = "TOUCH_MOVE",
    END = "TOUCH_END",
}

export enum GestureEventName {
    PINCH = "GESTURE_PINCH",
    ROTATE = "GESTURE_ROTATE"
}

export class GestureEvent implements TouchEvent {
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
    [TouchEventName.START]: (event: TouchEvent) => void;
    [TouchEventName.MOVE]: (event: TouchEvent) => void;
    [TouchEventName.END]: (event: TouchEvent) => void;

    [GestureEventName.PINCH]: (event: GestureEvent) => void;
    [GestureEventName.ROTATE]: (event: GestureEvent) => void;
}

export interface InputReadonly extends EventReceiver<EventToListener> { }

function distance(event: TouchEvent) {
    const x = event.x(0) - event.x(1);
    const y = event.y(0) - event.y(1);
    return Math.sqrt(x * x + y * y);
}

export class Input extends EventEmitterImpl<EventToListener> implements InputReadonly {
    private _dist: number = 0;

    onTouchStart(event: TouchEvent) {
        if (event.count < 2) {
            this.emit(TouchEventName.START, event);
            return;
        }

        this._dist = distance(event);
    }
    onTouchMove(event: TouchEvent) {
        if (event.count < 2) {
            this.emit(TouchEventName.MOVE, event);
            return;
        }

        const d = distance(event);
        this.emit(GestureEventName.PINCH, new GestureEvent(event, d - this._dist));
        this._dist = d;
    }
    onTouchEnd(event: TouchEvent) {
        this.emit(TouchEventName.END, event);
    }
    onWheel(event: WheelEvent) {
        this.emit(GestureEventName.PINCH, new GestureEvent(event, event.delta));
    }
}

export { TouchEvent, WheelEvent };

