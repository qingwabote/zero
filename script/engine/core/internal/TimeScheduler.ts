interface Data {
    readonly delay: number;
    delta: number;
}

export class TimeScheduler {
    private _tasks: Map<(dt: number) => void, Data> = new Map;

    setInterval(func: (dt: number) => void, delay: number = 0) {
        this._tasks.set(func, { delay, delta: -1 /* escape from first update */ });
        return func;
    }

    clearInterval(func: (dt: number) => void) {
        this._tasks.delete(func);
    }

    update(dt: number) {
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