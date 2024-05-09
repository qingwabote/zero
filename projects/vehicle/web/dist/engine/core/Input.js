import { EventEmitterImpl } from "bastard";
export var TouchEventName;
(function (TouchEventName) {
    TouchEventName["START"] = "TOUCH_START";
    TouchEventName["MOVE"] = "TOUCH_MOVE";
    TouchEventName["END"] = "TOUCH_END";
})(TouchEventName || (TouchEventName = {}));
export var GestureEventName;
(function (GestureEventName) {
    GestureEventName["PINCH"] = "GESTURE_PINCH";
    GestureEventName["ROTATE"] = "GESTURE_ROTATE";
})(GestureEventName || (GestureEventName = {}));
export class GestureEvent {
    get count() {
        return this._event.count;
    }
    get delta() {
        return this._delta;
    }
    constructor(_event, _delta) {
        this._event = _event;
        this._delta = _delta;
    }
    x(index) {
        return this._event.x(index);
    }
    y(index) {
        return this._event.y(index);
    }
}
function distance(event) {
    const x = event.x(0) - event.x(1);
    const y = event.y(0) - event.y(1);
    return Math.sqrt(x * x + y * y);
}
export class Input extends EventEmitterImpl {
    constructor() {
        super(...arguments);
        this._dist = 0;
    }
    onTouchStart(event) {
        if (event.count < 2) {
            this.emit(TouchEventName.START, event);
            return;
        }
        this._dist = distance(event);
    }
    onTouchMove(event) {
        if (event.count < 2) {
            this.emit(TouchEventName.MOVE, event);
            return;
        }
        const d = distance(event);
        this.emit(GestureEventName.PINCH, new GestureEvent(event, d - this._dist));
        this._dist = d;
    }
    onTouchEnd(event) {
        this.emit(TouchEventName.END, event);
    }
    onWheel(event) {
        this.emit(GestureEventName.PINCH, new GestureEvent(event, event.delta));
    }
}
