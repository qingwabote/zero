export class CascadedMap {
    constructor(weak = false) {
        this._data = weak ? new WeakMap : new Map;
    }
    get(keys) {
    }
}
const foo = new CascadedMap;
foo.get();
