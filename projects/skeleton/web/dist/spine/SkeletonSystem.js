import { System, Zero } from "engine";
export class SkeletonSystem extends System {
    constructor() {
        super(...arguments);
        this._states = new Map;
    }
    addAnimation(state, skeleton) {
        this._states.set(state, skeleton);
    }
    update(dt) {
        for (const [state, skeleton] of this._states) {
            state.update(dt);
            state.apply(skeleton);
        }
    }
}
SkeletonSystem.instance = new SkeletonSystem();
Zero.registerSystem(SkeletonSystem.instance, 0);
