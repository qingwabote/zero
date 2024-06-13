import { Material } from "../core/render/scene/Material.js";
import { PassInstance } from "./PassInstance.js";
export class MaterialInstance extends Material {
    constructor(raw) {
        const passes = [];
        for (const pass of raw.passes) {
            passes.push(PassInstance.PassInstance(pass));
        }
        super(passes);
    }
}
