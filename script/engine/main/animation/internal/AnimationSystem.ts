import { System } from "../../core/System.js";
import { Zero } from "../../core/Zero.js";
import { AnimationState } from "./AnimationState.js";

export class AnimationSystem implements System {
    static readonly instance = new AnimationSystem();

    private _states: Map<AnimationState, AnimationState> = new Map;

    get ready(): boolean {
        return true;
    }

    addAnimation(state: AnimationState) {
        this._states.set(state, state);
    }

    update(dt: number): void {
        for (const state of this._states.keys()) {
            state.update(dt);
        }
    }
}

Zero.registerSystem(AnimationSystem.instance, 0)