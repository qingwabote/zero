import System from "../core/System.js";
import Zero from "../core/Zero.js";
import AnimationState from "./AnimationState.js";

export default class AnimationSystem implements System {
    static readonly instance = new AnimationSystem();

    private _time: number = 0;

    private _states: Map<AnimationState, AnimationState> = new Map;

    start(): void {
        this._time = new Date().getSeconds();
    }

    addAnimation(state: AnimationState) {
        this._states.set(state, state);
    }

    update(): void {
        const now = Date.now() / 1000;
        const dt = now - this._time;
        for (const state of this._states.keys()) {
            state.update(dt);
        }
        this._time = now;
    }
}

Zero.registerSystem(AnimationSystem.instance, 0)