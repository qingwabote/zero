import { Mat4Like } from "../core/math/mat4.js";
import { Transform } from "../core/render/scene/Transform.js";
import { SkinInstance } from "./SkinInstance.js";

export class Skin {
    constructor(
        readonly inverseBindMatrices: readonly Readonly<Mat4Like>[],
        readonly joints: readonly (readonly string[])[]
    ) { }

    instantiate(root: Transform): SkinInstance {
        return new SkinInstance(root, this);
    }
}