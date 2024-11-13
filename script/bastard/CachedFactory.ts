type MapLike<K extends object, V> = Map<K, V> | WeakMap<K, V>;

export class CachedFactory<Keys extends object[], Value> {
    private _cache: MapLike<object, any>;

    constructor(
        private readonly _create: (keys: Readonly<Keys>) => Value,
        private readonly _weak: boolean = false
    ) {
        this._cache = _weak ? new WeakMap : new Map;
    }

    get(keys: Readonly<Keys>): Value {
        let current = this._cache;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            let cur = current.get(key);
            if (!cur) {
                current.set(key, cur = this._weak ? new WeakMap : new Map);
            }
            current = cur;
        }

        const key = keys[keys.length - 1];
        let value: Value | undefined = current.get(key);
        if (!value) {
            current.set(key, value = this._create(keys));
        }

        return value;
    }
}