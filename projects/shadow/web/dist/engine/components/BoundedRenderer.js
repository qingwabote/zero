import { EventEmitterImpl } from "bastard";
import { ModelRenderer } from "./internal/ModelRenderer.js";
export var BoundsEventName;
(function (BoundsEventName) {
    BoundsEventName["BOUNDS_CHANGED"] = "BOUNDS_CHANGED";
})(BoundsEventName || (BoundsEventName = {}));
const emitter = new EventEmitterImpl;
emitter.on(BoundsEventName.BOUNDS_CHANGED, () => { });
/**
 * Provides a bounds for ui system
 */
export class BoundedRenderer extends ModelRenderer {
    constructor() {
        super(...arguments);
        this.__emitter = undefined;
    }
    get _emitter() {
        var _a;
        return (_a = this.__emitter) !== null && _a !== void 0 ? _a : (this.__emitter = new EventEmitterImpl);
    }
    has(name) {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on(name, listener) {
        return this._emitter.on(name, listener);
    }
    off(name, listener) {
        this._emitter.off(name, listener);
    }
    emit(name, ...args) {
        var _a;
        (_a = this.__emitter) === null || _a === void 0 ? void 0 : _a.emit(name, ...args);
    }
}
BoundedRenderer.PIXELS_PER_UNIT = 100;
