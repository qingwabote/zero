import { Mat4Like } from "../core/math/mat4.js";

export default interface Skin {
    readonly inverseBindMatrices: readonly Readonly<Mat4Like>[];
    readonly joints: readonly (readonly string[])[];
}