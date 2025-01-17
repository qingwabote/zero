import { System, Zero } from "engine";
import { AnimationState } from "./AnimationState.js";

export class SkeletonSystem extends System {
    static readonly instance = new SkeletonSystem();

    private _states: Set<AnimationState> = new Set;

    addAnimation(state: AnimationState) {
        this._states.add(state);
    }

    removeAnimation(state: AnimationState) {
        this._states.delete(state);
    }

    update(dt: number): void {
        for (const state of this._states) {
            state.update(dt);
        }
    }
}

Zero.registerSystem(SkeletonSystem.instance, 0)