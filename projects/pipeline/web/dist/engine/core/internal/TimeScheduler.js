export class TimeScheduler {
    constructor() {
        this._funcs = new Map;
    }
    setInterval(func, delay = 0) {
        this._funcs.set(func, func);
        return func;
    }
    clearInterval(func) {
        this._funcs.delete(func);
    }
    update() {
        for (const [func] of this._funcs) {
            func();
        }
    }
}
