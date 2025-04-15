import { pk } from "puttyknife";
import { SkeletonData } from "./SkeletonData.js";

export class AnimationState {
    readonly pointer: number;

    constructor(data: SkeletonData) {
        this.pointer = pk.fn.spiAnimationState_create(data.pointer);
    }

    addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number) {
        const animationNamePtr = pk.heap.addString(animationName);
        pk.fn.spiAnimationState_addAnimationByName(this.pointer, trackIndex, animationNamePtr, loop ? 1 : 0, delay);
        pk.heap.delString(animationNamePtr);
    }

    update(dt: number): void {
        pk.fn.spiAnimationState_update(this.pointer, dt);
    }
}