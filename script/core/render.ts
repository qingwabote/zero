import { Mat4 } from "./math/mat4.js";

export interface TransformSource {
    matrix: Readonly<Mat4>;
    updateMatrix(): void;
}

const _dirtyTransforms: Map<TransformSource, TransformSource> = new Map;

export default {
    get dirtyTransforms(): Map<TransformSource, TransformSource> {
        return _dirtyTransforms;
    }
}