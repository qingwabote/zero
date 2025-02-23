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
                this._event2callbacks.set(name, callbacks = new Set);
            }
            callbacks.add(listener);
            return listener;
        }
        off(name, listener) {
            var _a;
            (_a = this._event2callbacks.get(name)) === null || _a === void 0 ? void 0 : _a.delete(listener);
        }
        emit(name, ...args) {
            const callbacks = this._event2callbacks.get(name);
            if (!callbacks) {
                return;
            }
            for (const fn of callbacks) {
                fn(...args);
            }
        }
    }
    EventEmitter.Impl = Impl;
})(EventEmitter || (EventEmitter = {}));
