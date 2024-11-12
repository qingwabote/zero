import { System } from "../core/System.js";
import { Zero } from "../core/Zero.js";
import { AnimationState } from "./AnimationState.js";

export class AnimationSystem extends System {
    static readonly instance = new AnimationSystem();

    private _states: Map<AnimationState, AnimationState> = new Map;

    addAnimation(state: AnimationState) {
        this._states.set(state, state);
    }

    removeAnimation(state: AnimationState) {
        this._states.delete(state);
    }

    override update(dt: number): void {
        for (const state of this._states.keys()) {
            state.update(dt);
        }
    }
}

Zero.registerSystem(AnimationSystem.instance, 0)