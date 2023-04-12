import Material from "./assets/Material.js";
import Pass from "./core/scene/Pass.js";
import PassInstance from "./PassInstance.js";

export default class MaterialInstance extends Material {
    constructor(raw: Material) {
        const passes: Pass[] = [];
        for (const pass of raw.passes) {
            const instance = new PassInstance(pass);
            instance.initialize()
            passes.push(instance)
        }
        super(passes);
    }
}