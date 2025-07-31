declare const kind: unique symbol;

export declare type Queue<T> = {
    readonly [kind]: 'Queue';
    [Symbol.iterator](): ArrayIterator<T>;
}

export function Queue<T>(impl: T[]): Queue<T> {
    return impl as unknown as Queue<T>;
}

function* drain<T>(q: Queue<T>) {
    yield* q as unknown as T[];
    (q as unknown as T[]).length = 0;
}

(Queue).drain = drain;

export declare namespace Queue {
    export { drain }
}