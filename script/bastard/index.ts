export * from './CachedFactory.js';
export * from './empty.js';
export * from './EventEmitter.js';
export * from './murmurhash2_gc.js';
export * from './RecycleQueue.js';
export * from './SmartRef.js';

export type DeepReadonly<T> = {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
};
