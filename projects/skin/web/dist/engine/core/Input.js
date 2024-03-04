import { EventEmitterImpl } from "bastard";
export var TouchEventName;
(function (TouchEventName) {
    TouchEventName["START"] = "TOUCH_START";
    TouchEventName["MOVE"] = "TOUCH_MOVE";
    TouchEventName["END"] = "TOUCH_END";
    TouchEventName["PINCH"] = "GESTURE_PINCH";
    TouchEventName["ROTATE"] = "GESTURE_ROTATE";
})(TouchEventName || (TouchEventName = {}));
export class Input extends EventEmitterImpl {
}
