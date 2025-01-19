import { wasm } from "./wasm.js";
export class AnimationState {
    constructor(data) {
        this.pointer = wasm.exports.spiAnimationState_create(data.pointer);
    }
    addAnimationByName(trackIndex, animationName, loop, delay) {
        const animationNamePtr = wasm.string_malloc(animationName);
        wasm.exports.spiAnimationState_addAnimationByName(this.pointer, trackIndex, animationNamePtr, loop ? 1 : 0, delay);
        wasm.string_free(animationNamePtr);
    }
    update(dt) {
        wasm.exports.spiAnimationState_update(this.pointer, dt);
    }
}
