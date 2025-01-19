import { CallbackCollection } from "./CallbackCollection.js";
export var EventEmitter;
(function (EventEmitter) {
    class Impl {
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
            return listener;
        }
        off(name, listener) {
            let callbacks = this._event2callbacks.get(name);
            callbacks === null || callbacks === void 0 ? void 0 : callbacks.delete(listener);
        }
        emit(name, ...args) {
            const callbacks = this._event2callbacks.get(name);
            callbacks === null || callbacks === void 0 ? void 0 : callbacks.call(...args);
        }
    }
    EventEmitter.Impl = Impl;
})(EventEmitter || (EventEmitter = {}));
