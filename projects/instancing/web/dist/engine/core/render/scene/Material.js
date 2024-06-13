export class Material {
    constructor(passes) {
        this.passes = passes;
    }
    instantiate() {
        return new Material(this.passes.map(pass => pass.instantiate()));
    }
}
