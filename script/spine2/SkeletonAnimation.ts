import { AnimationState } from "./AnimationState.js";
import { SkeletonData } from "./SkeletonData.js";
import { SkeletonRenderer } from "./SkeletonRenderer.js";
import { SkeletonSystem } from "./SkeletonSystem.js";
import { wasm } from "./wasm.js";

export class SkeletonAnimation extends SkeletonRenderer {
    private _state?: AnimationState | undefined = undefined;
    public get state(): AnimationState | undefined {
        return this._state;
    }

    public override set data(value: SkeletonData) {
        if (this._state) {
            SkeletonSystem.instance.removeAnimation(this._state);
            throw new Error("unimplemented");
        }

        const state = new AnimationState(value);
        SkeletonSystem.instance.addAnimation(state);
        this._state = state;

        super.data = value;
    }

    override lateUpdate(): void {
        wasm.exports.spiAnimationState_apply(this._state!.pointer, this._pointer);
        super.lateUpdate();
    }
}