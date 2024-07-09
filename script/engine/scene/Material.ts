import { Material as _Material } from "../core/render/scene/Material.js";
import { Pass } from "./Pass.js";

export interface MaterialReadonly extends _Material {
    readonly passes: readonly Pass[]
}

export interface Material extends MaterialReadonly {
    passes: Pass[]
}

export declare namespace Material {
    export { MaterialReadonly as Readonly }
}