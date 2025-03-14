export class TimeScheduler {
    constructor() {
        this._tasks = new Map;
    }
    setInterval(func, delay = 0) {
        this._tasks.set(func, { delay, delta: -1 /* escape from first update */ });
        return func;
    }
    clearInterval(func) {
        this._tasks.delete(func);
    }
    update(dt) {
        for (const [func, data] of this._tasks) {
            if (data.delta < 0 /* escape from first update */) {
                data.delta = dt;
                continue;
            }
            data.delta += dt;
            if (data.delta < data.delay) {
                continue;
            }
            func(data.delta);
            data.delta = data.delta - data.delay;
        }
    }
}
