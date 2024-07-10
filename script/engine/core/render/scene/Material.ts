import { Pass } from "./Pass.js";

export interface Material {
    readonly passes: readonly Pass[]
}