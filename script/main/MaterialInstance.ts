import Material from "./assets/Material.js";

export default class MaterialInstance extends Material {
    constructor(proto: Material) {
        super(proto.passes);
    }
}