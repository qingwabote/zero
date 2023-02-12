import CallbackCollection from "./CallbackCollection.js";
import CallbackMap from "./callbackcollections/CallbackMap.js";

type Listener = (event: any) => void;

export default class EventEmitter<EventToListener> {
    private _event2callbacks: Map<string, CallbackCollection> = new Map;

    on<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackMap;
            this._event2callbacks.set(name, callbacks);
        }

        callbacks.set(listener);
    }

    off<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void {
        let callbacks = this._event2callbacks.get(name);
        callbacks?.delete(listener);
    }

    emit<K extends keyof EventToListener & string>(name: K, event?: Parameters<EventToListener[K] extends Listener ? EventToListener[K] : Listener>[0]): void {
        const callbacks = this._event2callbacks.get(name);
        callbacks?.call(event)
    }
}