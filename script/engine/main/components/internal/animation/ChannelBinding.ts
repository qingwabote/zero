function binarySearch(source: ArrayLike<number>, value: number, EPSILON = 1e-6): number {
    let head = 0;
    let tail = source.length - 1;
    while (head <= tail) {
        const mid = (head + tail) >>> 1;
        const res = source[mid];
        if ((value + EPSILON) < res) {
            tail = mid - 1;
        } else if ((value - EPSILON) > res) {
            head = mid + 1;
        } else {
            return mid;
        }
    }
    return ~head;
}

export interface ChannelBindingValue {
    set(buffer: ArrayLike<number>, index: number): void;
    lerp(buffer: ArrayLike<number>, prev: number, next: number, t: number): void;
}

export class ChannelBinding {
    constructor(private _input: ArrayLike<number>, private _output: ArrayLike<number>, private _value: ChannelBindingValue) { }

    sample(time: number): void {
        const times = this._input;

        let index: number;
        if (time < times[0]) {
            index = 0;
        } else if (time > times[times.length - 1]) {
            index = times.length - 1;
        } else {
            index = binarySearch(times, time);
        }

        if (index >= 0) {
            this._value.set(this._output, index);
        } else {
            const next = ~index;
            const prev = next - 1;

            const t = (time - times[prev]) / (times[next] - times[prev]);
            this._value.lerp(this._output, prev, next, t);
        }
    }
}