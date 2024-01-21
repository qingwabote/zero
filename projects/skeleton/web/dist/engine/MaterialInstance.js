import { Material } from "./assets/Material.js";
import { PassInstance } from "./PassInstance.js";
export class MaterialInstance extends Material {
    constructor(raw) {
        const passes = [];
        for (const pass of raw.passes) {
            const instance = new PassInstance(pass);
            instance.initialize();
            passes.push(instance);
        }
        super(passes);
    }
}
