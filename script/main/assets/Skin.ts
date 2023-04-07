import { Mat4 } from "../core/math/mat4.js";

export default interface Skin {
    readonly inverseBindMatrices: readonly Readonly<Mat4>[];
    readonly joints: readonly (readonly string[])[];
}