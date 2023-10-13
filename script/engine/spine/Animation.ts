import * as sc from '@esotericsoftware/spine-core';
import { Skeleton } from "./Skeleton.js";
import { SkeletonSystem } from './internal/SkeletonSystem.js';

export class Animation extends Skeleton {
    private _state!: sc.AnimationState;
    public get state(): sc.AnimationState {
        return this._state;
    }

    public override set data(value: sc.SkeletonData) {
        super.data = value;
        this._state = new sc.AnimationState(new sc.AnimationStateData(value));
        SkeletonSystem.instance.addAnimation(this._state, this._skeleton);
    }
}