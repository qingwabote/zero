import * as sc from '@esotericsoftware/spine-core';
import { SkeletonRenderer } from "./SkeletonRenderer.js";
import { SkeletonSystem } from './internal/SkeletonSystem.js';

export class SkeletonAnimation extends SkeletonRenderer {
    private _state!: sc.AnimationState;
    public get state(): sc.AnimationState {
        return this._state;
    }

    public override set skeletonData(value: sc.SkeletonData) {
        super.skeletonData = value;
        this._state = new sc.AnimationState(new sc.AnimationStateData(value));
        SkeletonSystem.instance.addAnimation(this._state, this._skeleton);
    }
}