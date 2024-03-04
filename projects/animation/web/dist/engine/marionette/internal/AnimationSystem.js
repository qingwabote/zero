import { System } from "../../core/System.js";
import { Zero } from "../../core/Zero.js";
export class AnimationSystem extends System {
    constructor() {
        super(...arguments);
        this._states = new Map;
    }
    addAnimation(state) {
        this._states.set(state, state);
    }
    update(dt) {
        for (const state of this._states.keys()) {
            state.update(dt);
        }
    }
}
AnimationSystem.instance = new AnimationSystem();
Zero.registerSystem(AnimationSystem.instance, 0);
