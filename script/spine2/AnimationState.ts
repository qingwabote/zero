import { spi } from "spi";
import { SkeletonData } from "./SkeletonData.js";

export class AnimationState {
    readonly pointer: number;

    constructor(data: SkeletonData) {
        this.pointer = spi.fn.spiAnimationState_create(data.pointer);
    }

    addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number) {
        const animationNamePtr = spi.heap.addString(animationName);
        spi.fn.spiAnimationState_addAnimationByName(this.pointer, trackIndex, animationNamePtr, loop ? 1 : 0, delay);
        spi.heap.delString(animationNamePtr);
    }

    update(dt: number): void {
        spi.fn.spiAnimationState_update(this.pointer, dt);
    }
}