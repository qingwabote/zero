import { AnimationStateBase } from "./AnimationStateBase.js";
import { ClipBinging } from "./ClipBinging.js";

export class AnimationStateSingle extends AnimationStateBase {
    public override get duration(): number {
        return this._clip.duration;
    }

    constructor(private readonly _clip: ClipBinging) {
        super();
    }

    protected sample(time: number) {
        for (const channel of this._clip.channels) {
            channel.sample(time);
        }
    }
}