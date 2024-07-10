import { CallbackCollection } from "./CallbackCollection.js";

interface EventEmitterReadonly<EventToListener extends Record<string, any>> {
    has<K extends keyof EventToListener>(name: K): boolean;

    on<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): EventToListener[K];

    off<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): void;
}

export interface EventEmitter<EventToListener extends Record<string, any>> extends EventEmitterReadonly<EventToListener> {
    emit<K extends keyof EventToListener>(name: K, ...args: Parameters<EventToListener[K]>): void;
}

export namespace EventEmitter {
    export class Impl<EventToListener extends Record<string, any>> implements EventEmitter<EventToListener> {
        private _event2callbacks: Map<string | number | symbol, CallbackCollection> = new Map;

        has<K extends keyof EventToListener>(name: K): boolean {
            return this._event2callbacks.has(name);
        }

        on<K extends keyof EventToListener>(name: K, listener: EventToListener[K]) {
            let callbacks = this._event2callbacks.get(name);
            if (!callbacks) {
                callbacks = new CallbackCollection;
                this._event2callbacks.set(name, callbacks);
            }
            callbacks.set(listener);
            return listener;
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
}

export declare namespace EventEmitter {
    export { EventEmitterReadonly as Readonly }
}

