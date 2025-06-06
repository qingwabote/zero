import { AnimationSampler } from "../../animating/AnimationSampler.js";
import { ClipBinging } from "../../animating/ClipBinging.js";

export class Solo implements AnimationSampler {
    public get duration(): number {
        return this._clip.duration;
    }

    constructor(private readonly _clip: ClipBinging) { }

    public update(time: number) {
        this._clip.sample(time);
    }
}