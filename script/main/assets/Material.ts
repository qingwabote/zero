import Pass from "../core/scene/Pass.js";
import Effect from "./Effect.js";

interface PassOverride {
    macros: Record<string, number>;
}

export default class Material {
    static create(effect: Effect, overrides: PassOverride[]) {

    }
    constructor(readonly passes: Pass[]) {
    }
}