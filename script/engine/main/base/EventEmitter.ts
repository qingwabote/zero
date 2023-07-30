type Listener = (event: any) => void;

export interface EventEmitter<EventToListener> {
    has<K extends keyof EventToListener & string>(name: K): boolean;

    on<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void;

    off<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void;

    emit<K extends keyof EventToListener & string>(name: K, event?: Parameters<EventToListener[K] extends Listener ? EventToListener[K] : Listener>[0]): void;
}
