export interface EventEmitter<EventToListener extends Record<string, any>> {
    has<K extends keyof EventToListener>(name: K): boolean;

    on<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): EventToListener[K];

    off<K extends keyof EventToListener>(name: K, listener: EventToListener[K]): void;

    emit<K extends keyof EventToListener>(name: K, ...args: Parameters<EventToListener[K]>): void;
}
