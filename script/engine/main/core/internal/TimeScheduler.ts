export class TimeScheduler {
    private _funcs: Map<() => void, () => void> = new Map;

    setInterval(func: () => void, delay: number = 0) {
        this._funcs.set(func, func);
        return func;
    }

    clearInterval(func: () => void) {
        this._funcs.delete(func);
    }

    update() {
        for (const [func] of this._funcs) {
            func();
        }
    }
}