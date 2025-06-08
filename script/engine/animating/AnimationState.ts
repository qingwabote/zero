import { AnimationSampler } from "./AnimationSampler.js";

export class AnimationState {
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
    }

    constructor(private readonly _sampler: AnimationSampler) { }

    update(dt: number): void {
        let time = this._time;
        this._sampler.sample(time)

        const duration = this._sampler.duration;
        if (time < duration) {
            time += dt;
            time = Math.min(time, duration);
        }
        else {
            time = 0;
        }
        this._time = time;
    }
}