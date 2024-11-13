export class CachedFactory {
    constructor(_create, _weak = false) {
        this._create = _create;
        this._weak = _weak;
        this._cache = _weak ? new WeakMap : new Map;
    }
    get(keys) {
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
        let value = current.get(key);
        if (!value) {
            current.set(key, value = this._create(keys));
        }
        return value;
    }
}
