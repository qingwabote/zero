import { Mat4 } from "../math/mat4.js";
import { Vec3 } from "../math/vec3.js";
import VisibilityBit from "./VisibilityBit.js";

export interface RenderNode {
    visibility: VisibilityBit;
    position: Readonly<Vec3>;
    matrix: Readonly<Mat4>;
}