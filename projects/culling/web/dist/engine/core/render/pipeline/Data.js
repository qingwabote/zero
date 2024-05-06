import { EventEmitterImpl } from "bastard";
var Event;
(function (Event) {
    Event["UPDATE"] = "UPDATE";
})(Event || (Event = {}));
export class Data extends EventEmitterImpl {
    constructor() {
        super(...arguments);
        this.shadow = null;
        this.flowLoopIndex = 0;
    }
    update(dumping) {
        var _a;
        (_a = this.shadow) === null || _a === void 0 ? void 0 : _a.update(dumping);
        this.emit(Event.UPDATE);
    }
}
Data.Event = Event;
