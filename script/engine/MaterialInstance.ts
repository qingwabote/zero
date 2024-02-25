import { Material } from "./core/render/scene/Material.js";
import { Pass } from "./core/render/scene/Pass.js";
import { PassInstance } from "./PassInstance.js";

export class MaterialInstance extends Material {
    constructor(raw: Material) {
        const passes: Pass[] = [];
        for (const pass of raw.passes) {
            const instance = new PassInstance(pass);
            instance.initialize();
            passes.push(instance);
        }
        super(passes);
    }
}