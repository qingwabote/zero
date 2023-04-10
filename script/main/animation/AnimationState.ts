import { Sampler } from "../assets/Animation.js";

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
            index = binarySearch(times, time);
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