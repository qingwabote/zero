import { EventEmitterImpl } from "bastard";
function modelCompareFn(a, b) {
    return a.order - b.order;
}
var Event;
(function (Event) {
    Event["CAMERA_ADD"] = "CAMERA_ADD";
})(Event || (Event = {}));
export class Root extends EventEmitterImpl {
    constructor() {
        super(...arguments);
        this.directionalLight = undefined;
        this._cameras = [];
        this._models = [];
    }
    get cameras() {
        return this._cameras;
    }
    get models() {
        return this._models;
    }
    addCamera(camera) {
        this._cameras.push(camera);
        this.emit(Event.CAMERA_ADD);
    }
    addModel(model) {
        this._models.push(model);
        model.onAddToScene();
    }
    update() {
        var _a;
        (_a = this.directionalLight) === null || _a === void 0 ? void 0 : _a.update();
        for (const camera of this._cameras) {
            camera.update();
        }
        this._models.sort(modelCompareFn);
        for (const model of this._models) {
            model.update();
        }
    }
}
Root.Event = Event;
export const root = new Root;
