function binarySearch(source, value, EPSILON = 1e-6) {
    let head = 0;
    let tail = source.length - 1;
    while (head <= tail) {
        const mid = (head + tail) >>> 1;
        const res = source[mid];
        if ((value + EPSILON) < res) {
            tail = mid - 1;
        }
        else if ((value - EPSILON) > res) {
            head = mid + 1;
        }
        else {
            return mid;
        }
    }
    return ~head;
}
export class ChannelBinding {
    constructor(_input, _output, _value) {
        this._input = _input;
        this._output = _output;
        this._value = _value;
    }
    sample(time) {
        const times = this._input;
        let index;
        if (time < times[0]) {
            index = 0;
        }
        else if (time > times[times.length - 1]) {
            index = times.length - 1;
        }
        else {
            index = binarySearch(times, time);
        }
        if (index >= 0) {
            this._value.set(this._output, index);
        }
        else {
            const next = ~index;
            const prev = next - 1;
            const t = (time - times[prev]) / (times[next] - times[prev]);
            this._value.lerp(this._output, prev, next, t);
        }
    }
}
