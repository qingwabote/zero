import { System, Zero } from "engine";
export class SkeletonSystem extends System {
    constructor() {
        super(...arguments);
        this._states = new Set;
    }
    addAnimation(state) {
        this._states.add(state);
    }
    removeAnimation(state) {
        this._states.delete(state);
    }
    update(dt) {
        for (const state of this._states) {
            state.update(dt);
        }
    }
}
SkeletonSystem.instance = new SkeletonSystem();
Zero.registerSystem(SkeletonSystem.instance, 0);
