import { Pass } from "./Pass.js";

export class Material {
    constructor(readonly passes: Pass[]) { }

    instantiate() {
        return new Material(this.passes.map(pass => pass.instantiate()));
    }
}