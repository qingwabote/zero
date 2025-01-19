import { EventEmitter } from "bastard";
var TouchEvents;
(function (TouchEvents) {
    TouchEvents["START"] = "TOUCH_START";
    TouchEvents["MOVE"] = "TOUCH_MOVE";
    TouchEvents["END"] = "TOUCH_END";
})(TouchEvents || (TouchEvents = {}));
var GestureEvents;
(function (GestureEvents) {
    GestureEvents["PINCH"] = "GESTURE_PINCH";
    GestureEvents["ROTATE"] = "GESTURE_ROTATE";
})(GestureEvents || (GestureEvents = {}));
class GestureEvent {
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
export class Input extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this._dist = 0;
    }
    onTouchStart(event) {
        if (event.count < 2) {
            this.emit(TouchEvents.START, event);
            return;
        }
        this._dist = distance(event);
    }
    onTouchMove(event) {
        if (event.count < 2) {
            this.emit(TouchEvents.MOVE, event);
            return;
        }
        const d = distance(event);
        this.emit(GestureEvents.PINCH, new GestureEvent(event, d - this._dist));
        this._dist = d;
    }
    onTouchEnd(event) {
        this.emit(TouchEvents.END, event);
    }
    onWheel(event) {
        this.emit(GestureEvents.PINCH, new GestureEvent(event, event.delta));
    }
}
Input.TouchEvents = TouchEvents;
Input.GestureEvents = GestureEvents;
