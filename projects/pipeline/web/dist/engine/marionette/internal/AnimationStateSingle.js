import { AnimationState } from "../../animating/AnimationState.js";
export class AnimationStateSingle extends AnimationState {
    get duration() {
        return this._clip.duration;
    }
    constructor(_clip) {
        super();
        this._clip = _clip;
    }
    sample(time) {
        this._clip.sample(time);
    }
}
