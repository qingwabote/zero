import { CallbackCollection } from "./CallbackCollection.js";
import { EventEmitter } from "./EventEmitter.js";

type Listener = (event: any) => void;

export class EventEmitterImpl<EventToListener> implements EventEmitter<EventToListener> {
    private _event2callbacks: Map<string, CallbackCollection> = new Map;

    has<K extends keyof EventToListener & string>(name: K): boolean {
        return this._event2callbacks.has(name);
    }

    on<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackCollection;
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