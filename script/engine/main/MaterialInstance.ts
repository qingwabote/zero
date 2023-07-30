import { Material } from "./assets/Material.js";
import { Pass } from "./core/scene/Pass.js";
import { PassInstance } from "./PassInstance.js";

export class MaterialInstance extends Material {
    constructor(raw: Material) {
        const passes: Pass[] = [];
        for (const pass of raw.passes) {
            passes.push(new PassInstance(pass))
        }
        super(passes);
    }
}