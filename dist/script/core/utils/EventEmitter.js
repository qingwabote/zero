import CallbackMap from "./callbackcollections/CallbackMap.js";
export default class EventEmitter {
    _event2callbacks = new Map;
    on(name, listener) {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackMap;
            this._event2callbacks.set(name, callbacks);
        }
        callbacks.set(listener);
    }
    emit(name, event) {
        const callbacks = this._event2callbacks.get(name);
        callbacks?.call(event);
    }
}
//# sourceMappingURL=EventEmitter.js.map