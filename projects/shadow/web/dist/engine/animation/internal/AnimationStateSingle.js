import { AnimationStateBase } from "./AnimationStateBase.js";
export class AnimationStateSingle extends AnimationStateBase {
    get duration() {
        return this._clip.duration;
    }
    constructor(_clip) {
        super();
        this._clip = _clip;
    }
    sample(time) {
        for (const channel of this._clip.channels) {
            channel.sample(time);
        }
    }
}
