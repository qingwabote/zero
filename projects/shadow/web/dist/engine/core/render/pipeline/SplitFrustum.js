import { BoundingFurstum } from "./BoundingFrustum.js";
export class SplitFrustum {
    constructor(camera, count) {
        const levels = [];
        for (let i = 0; i < count; i++) {
            levels.push(new BoundingFurstum(camera, i / count, (i + 1) / count));
        }
        this.levels = levels;
    }
    update(dumping) {
        for (const level of this.levels) {
            level.update(dumping);
        }
    }
}
