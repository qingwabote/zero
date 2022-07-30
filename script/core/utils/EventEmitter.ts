import CallbackCollection from "./CallbackCollection.js";
import CallbackMap from "./callbackcollections/CallbackMap.js";

type Listener = (event: any) => void;

export default class EventEmitter<T> {
    private _event2callbacks: Map<string, CallbackCollection> = new Map;

    on<K extends keyof T & string>(name: K, listener: T[K] extends Listener ? T[K] : Listener): void {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackMap;
            this._event2callbacks.set(name, callbacks);
        }

        callbacks.set(listener);
    }

    emit<K extends keyof T & string>(name: K, event: Parameters<T[K] extends Listener ? T[K] : Listener>[0]): void {
        const callbacks = this._event2callbacks.get(name);
        callbacks?.call(event)
    }
}