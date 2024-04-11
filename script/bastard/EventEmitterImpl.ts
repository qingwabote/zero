import { CallbackCollection } from "./CallbackCollection.js";
import { EventEmitter } from "./EventEmitter.js";

export class EventEmitterImpl<EventToListener extends Record<string, any>> implements EventEmitter<EventToListener> {
    private _event2callbacks: Map<string | number | symbol, CallbackCollection> = new Map;

    has<K extends keyof EventToListener>(name: K): boolean {
        return this._event2callbacks.has(name);
    }

    on<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): void {
        let callbacks = this._event2callbacks.get(name);
        if (!callbacks) {
            callbacks = new CallbackCollection;
            this._event2callbacks.set(name, callbacks);
        }

        callbacks.set(listener);
    }

    off<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): void {
        let callbacks = this._event2callbacks.get(name);
        callbacks?.delete(listener);
    }

    emit<K extends keyof EventToListener>(name: K, ...args: Parameters<EventToListener[K]>): void {
        const callbacks = this._event2callbacks.get(name);
        callbacks?.call(...args)
    }
}