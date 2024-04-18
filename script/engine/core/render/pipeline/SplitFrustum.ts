import { Camera } from "../scene/Camera.js";
import { BoundingFurstum } from "./BoundingFrustum.js";

export class SplitFrustum {
    readonly levels: readonly BoundingFurstum[];

    constructor(camera: Camera) {
        const levels: BoundingFurstum[] = []
        for (let i = 0; i < 3; i++) {
            levels.push(new BoundingFurstum(camera))
        }
        this.levels = levels;
    }

    update(dumping: boolean) {
        for (const level of this.levels) {
            level.update(dumping);
        }
    }
}