import Animation from "../assets/Animation.js";
import Transform from "../core/scene/Transform.js";
import AnimationState from "./AnimationState.js";

export default class AnimationBlend extends AnimationState {
    constructor(private _transform: Transform, private _animations: readonly Animation[]) {
        let duration = 0;
        for (const animation of _animations) {
            duration = Math.max(duration, animation.duration)
        }
        super([], duration)
    }
}