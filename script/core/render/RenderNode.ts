import { Mat4 } from "../math/mat4.js";
import VisibilityBit from "./VisibilityBit.js";

export interface RenderNode {
    visibility: VisibilityBit;
    matrix: Readonly<Mat4>;
    updateMatrix(): void;
}