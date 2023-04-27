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
    set(buffer: ArrayLike<number>, index: number): void;
    lerp(buffer: ArrayLike<number>, prev: number, next: number, t: number): void;
}

export class ChannelBinding {
    constructor(private _sampler: Sampler, private _value: ChannelBindingValue) { }

    sample(time: number): void {
        const times = this._sampler.input;

        let index: number;
        if (time < times[0]) {
            index = 0;
        } else if (time > times[times.length - 1]) {
            index = times.length - 1;
        } else {
            index = binarySearch(times, time);
        }

        if (index >= 0) {
            this._value.set(this._sampler.output, index);
        } else {
            const next = ~index;
            const prev = next - 1;

            const t = (time - times[prev]) / (times[next] - times[prev]);
            this._value.lerp(this._sampler.output, prev, next, t);
        }
    }
}

export default class AnimationState {
    /**When set new time, we should ensure the frame at the specified time being played at next update.*/
    private _time_dirty = true;
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
        this._time_dirty = true;
    }

    speed: number = 1;

    constructor(private readonly _channels: readonly ChannelBinding[], readonly duration: number) { }

    update(dt: number): void {
        this._time += this._time_dirty ? 0 : (dt * this.speed);
        this._time = Math.min(this._time, this.duration);

        for (const channel of this._channels) {
            channel.sample(this._time);
        }

        this._time_dirty = false;

        if (this._time >= this.duration) {
            this.time = 0;
        }
    }
}