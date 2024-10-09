import { AnimationState } from "./AnimationState.js";
import { ClipBinging } from "./ClipBinging.js";

export class AnimationStateSingle extends AnimationState {
    public override get duration(): number {
        return this._clip.duration;
    }

    constructor(private readonly _clip: ClipBinging) {
        super();
    }

    protected sample(time: number) {
        this._clip.sample(time);
    }
}