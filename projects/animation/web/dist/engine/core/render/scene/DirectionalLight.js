import { EventEmitterImpl } from "bastard";
import { Zero } from "../../Zero.js";
import { DirectionalLightShadow } from "./DirectionalLightShadow.js";
var Event;
(function (Event) {
    Event["UPDATE"] = "UPDATE";
})(Event || (Event = {}));
export class DirectionalLight {
    get emitter() {
        var _a;
        return (_a = this._emitter) !== null && _a !== void 0 ? _a : (this._emitter = new EventEmitterImpl);
    }
    get shadows() {
        return this._shadows;
    }
    get shadow_cameras() {
        return this._shadow_cameras;
    }
    set shadow_cameras(value) {
        const cameras = Zero.instance.scene.cameras;
        for (let i = 0; i < value.length; i++) {
            const camera = cameras[value[i]];
            const shadow = this._shadows[value[i]] || (this._shadows[value[i]] = new DirectionalLightShadow(this, camera.frustum));
            shadow.index = i;
        }
        this._shadow_cameras = value;
    }
    constructor(transform) {
        this.transform = transform;
        this._emitter = undefined;
        this._shadows = {};
        this._shadow_cameras = [];
        Zero.instance.scene.directionalLight = this;
    }
    update() {
        var _a;
        for (let i = 0; i < this._shadow_cameras.length; i++) {
            this._shadows[this._shadow_cameras[i]].update();
        }
        (_a = this._emitter) === null || _a === void 0 ? void 0 : _a.emit(Event.UPDATE);
    }
}
DirectionalLight.Event = Event;
