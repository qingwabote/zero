import { spi } from "spi";
export class AnimationState {
    constructor(data) {
        this.pointer = spi.fn.spiAnimationState_create(data.pointer);
    }
    addAnimationByName(trackIndex, animationName, loop, delay) {
        const animationNamePtr = spi.heap.addString(animationName);
        spi.fn.spiAnimationState_addAnimationByName(this.pointer, trackIndex, animationNamePtr, loop ? 1 : 0, delay);
        spi.heap.delString(animationNamePtr);
    }
    update(dt) {
        spi.fn.spiAnimationState_update(this.pointer, dt);
    }
}
