import * as sc from '@esotericsoftware/spine-core';
import { Skeleton } from "./Skeleton.js";
import { SkeletonSystem } from './SkeletonSystem.js';
export class Animation extends Skeleton {
    get state() {
        return this._state;
    }
    set data(value) {
        super.data = value;
        this._state = new sc.AnimationState(new sc.AnimationStateData(value));
        SkeletonSystem.instance.addAnimation(this._state, this._skeleton);
    }
}
