import { AnimationClipInstance } from "../../animating/AnimationClipInstance.js";
import { AnimationSampler } from "../../animating/AnimationSampler.js";

export class Solo implements AnimationSampler {
    public get duration(): number {
        return this._clip.duration;
    }

    constructor(private readonly _clip: AnimationClipInstance) { }

    public update(time: number) {
        this._clip.sample(time);
    }
}