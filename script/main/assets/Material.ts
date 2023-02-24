import Pass from "../core/render/Pass.js";

export default class Material {
    constructor(readonly passes: Pass[]) {
    }
}