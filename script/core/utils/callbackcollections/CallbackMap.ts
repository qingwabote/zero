import CallbackCollection from "../CallbackCollection.js";

export default class CallbackMap implements CallbackCollection {
    private _map: Map<Function, Function> = new Map;

    set(callback: Function) {
        this._map.set(callback, callback);
    }

    delete(callback: Function) {
        this._map.delete(callback);
    }

    call(...args: any[]) {
        for (const callback of this._map.keys()) {
            callback(...args)
        }
    }

    clear() {
        this._map.clear()
    }
}