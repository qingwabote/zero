import { SkeletonData } from "./SkeletonData.js";
import { wasm } from "./wasm.js";

export class AnimationState {
    readonly pointer: number;

    constructor(data: SkeletonData) {
        this.pointer = wasm.exports.spiAnimationState_create(data.pointer);
    }

    addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number) {
        const animationNamePtr = wasm.string_malloc(animationName);
        wasm.exports.spiAnimationState_addAnimationByName(this.pointer, trackIndex, animationNamePtr, loop ? 1 : 0, delay);
        wasm.string_free(animationNamePtr);
    }

    update(dt: number): void {
        wasm.exports.spiAnimationState_update(this.pointer, dt);
    }
}