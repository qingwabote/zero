import { Mat4 } from "../core/math/mat4.js";

export default interface Skin {
    inverseBindMatrices: Mat4[];
    joints: string[][];
}