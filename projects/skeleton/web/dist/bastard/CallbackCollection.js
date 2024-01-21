export class CallbackCollection {
    constructor() {
        this._map = new Map;
    }
    set(callback) {
        this._map.set(callback, callback);
    }
    delete(callback) {
        this._map.delete(callback);
    }
    call(...args) {
        for (const callback of this._map.keys()) {
            callback(...args);
        }
    }
    clear() {
        this._map.clear();
    }
}
