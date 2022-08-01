import { Mat4 } from "./math/mat4.js";

export interface Transform {
    matrix: Readonly<Mat4>;
    updateMatrix(): void;
}

const _dirtyTransforms: Map<Transform, Transform> = new Map;

export default {
    get dirtyTransforms(): Map<Transform, Transform> {
        return _dirtyTransforms;
    }
}