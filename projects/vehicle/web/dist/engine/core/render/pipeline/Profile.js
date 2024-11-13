import { EventEmitter } from "bastard";
var Event;
(function (Event) {
    Event["CULL_START"] = "CULL_START";
    Event["CULL_END"] = "CULL_END";
    Event["BATCH_UPLOAD_START"] = "BATCH_UPLOAD_START";
    Event["BATCH_UPLOAD_END"] = "BATCH_UPLOAD_END";
})(Event || (Event = {}));
export class Profile extends EventEmitter.Impl {
    constructor() {
        super(...arguments);
        this.materials = 0;
        this.pipelines = 0;
        this.draws = 0;
        this.stages = 0;
    }
    clear() {
        this.materials = 0;
        this.pipelines = 0;
        this.draws = 0;
        this.stages = 0;
    }
}
Profile.Event = Event;
