import { CallbackCollection } from "./CallbackCollection.js";
export class EventEmitterImpl {
    constructor() {
        this._event2callbacks = new Map;
    }
    has(name) {
        return this._event2callbacks.has(name);
    }
    on(name, listener) {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackCollection;
            this._event2callbacks.set(name, callbacks);
        }
        callbacks.set(listener);
    }
    off(name, listener) {
        let callbacks = this._event2callbacks.get(name);
        callbacks === null || callbacks === void 0 ? void 0 : callbacks.delete(listener);
    }
    emit(name, event) {
        const callbacks = this._event2callbacks.get(name);
        callbacks === null || callbacks === void 0 ? void 0 : callbacks.call(event);
    }
}
