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
export class Input extends EventEmitterImpl {
}
