import Pass from "../core/scene/Pass.js";

export default class Material {
    constructor(readonly passes: Pass[]) { }
}