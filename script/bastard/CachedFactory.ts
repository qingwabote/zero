type MapLike<K extends object, V> = Map<K, V> | WeakMap<K, V>;

const pass = function () { return true };

export class CachedFactory<Keys extends object[], Value, Args extends any[] = []> {
    private _cache: MapLike<object, any>;

    constructor(
        private readonly _create: (keys: Readonly<Keys>, args: Readonly<Args>) => Value,
        private readonly _hit: (value: Value, args: Readonly<Args>) => boolean = pass,
        private readonly _weak: boolean = false
    ) {
        this._cache = _weak ? new WeakMap : new Map;
    }

    get(keys: Readonly<Keys>, args: Readonly<Args>): Value {
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
        let values: Value[] | undefined = current.get(key);
        if (!values) {
            current.set(key, values = []);
        }

        let value: Value | undefined
        for (const val of values) {
            if (this._hit(val, args)) {
                value = val;
                break;
            }
        }

        if (!value) {
            values.push(value = this._create(keys, args))
        }

        return value;
    }
}