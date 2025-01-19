import { AnimationState } from "./AnimationState.js";
import { SkeletonRenderer } from "./SkeletonRenderer.js";
import { SkeletonSystem } from "./SkeletonSystem.js";
import { wasm } from "./wasm.js";
export class SkeletonAnimation extends SkeletonRenderer {
    constructor() {
        super(...arguments);
        this._state = undefined;
    }
    get state() {
        return this._state;
    }
    set data(value) {
        if (this._state) {
            SkeletonSystem.instance.removeAnimation(this._state);
            throw new Error("unimplemented");
        }
        const state = new AnimationState(value);
        SkeletonSystem.instance.addAnimation(state);
        this._state = state;
        super.data = value;
    }
    upload(commandBuffer) {
        wasm.exports.spiAnimationState_apply(this._state.pointer, this._pointer);
        super.upload(commandBuffer);
    }
}
