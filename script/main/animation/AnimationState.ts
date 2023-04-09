import { Sampler } from "../assets/Animation.js";

function binarySearchEpsilon(array: ArrayLike<number>, value: number, EPSILON = 1e-6) {
    let low = 0;
    let high = array.length - 1;
    let middle = high >>> 1;
    for (; low <= high; middle = (low + high) >>> 1) {
        const test = array[middle];
        if (test > (value + EPSILON)) {
            high = middle - 1;
        } else if (test < (value - EPSILON)) {
            low = middle + 1;
        } else {
            return middle;
        }
    }
    return ~low;
}

export interface ChannelBindingValue {
    update(sampler: Sampler, index: number, time: number): void;
}

export class ChannelBinding {
    constructor(private _sampler: Sampler, private _value: ChannelBindingValue) { }

    update(time: number): void {
        const times = this._sampler.input;

        let index: number;
        if (time < times[0]) {
            index = 0;
        } else if (time > times[times.length - 1]) {
            index = times.length - 1;
        } else {
            index = binarySearchEpsilon(times, time);
        }

        this._value.update(this._sampler, index, time);
    }
}

export default class AnimationState {
    private _time_dirty = true;
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
        this._time_dirty = true;
    }

    constructor(private readonly _bindings: readonly ChannelBinding[], readonly duration: number) { }

    update(dt: number): void {
        this._time += this._time_dirty ? 0 : dt;
        this._time = Math.min(this._time, this.duration);

        for (const binding of this._bindings) {
            binding.update(this._time);
        }

        this._time_dirty = false;

        if (this._time >= this.duration) {
            this.time = 0;
        }
    }
}