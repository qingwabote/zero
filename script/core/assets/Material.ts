import Pass from "../render/Pass.js";

export default class Material {
    protected _passes: Pass[];
    get passes(): Pass[] {
        return this._passes;
    }

    constructor(passes: Pass[]) {
        this._passes = passes;
    }
}