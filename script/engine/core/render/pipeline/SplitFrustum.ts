import { Camera } from "../scene/Camera.js";
import { BoundingFurstum } from "./BoundingFrustum.js";

export class SplitFrustum {
    readonly levels: readonly BoundingFurstum[];

    constructor(camera: Camera, count: number) {
        const levels: BoundingFurstum[] = []
        for (let i = 0; i < count; i++) {
            levels.push(new BoundingFurstum(camera, i / count, (i + 1) / count))
        }
        this.levels = levels;
    }

    update(dumping: boolean) {
        for (const level of this.levels) {
            level.update(dumping);
        }
    }
}