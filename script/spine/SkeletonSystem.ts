import { AnimationState, Skeleton } from "@esotericsoftware/spine-core";
import { System, Zero } from "engine";

export class SkeletonSystem implements System {
    static readonly instance = new SkeletonSystem();

    private _states: Map<AnimationState, Skeleton> = new Map;

    addAnimation(state: AnimationState, skeleton: Skeleton) {
        this._states.set(state, skeleton);
    }

    update(dt: number): void {
        for (const [state, skeleton] of this._states) {
            state.update(dt);
            state.apply(skeleton);
        }
    }
}

Zero.registerSystem(SkeletonSystem.instance, 0)