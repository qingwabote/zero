import { Material as _Material } from "../core/render/scene/Material.js";
import { Pass } from "./Pass.js";

export interface Material extends _Material {
    readonly passes: readonly Pass[]
}