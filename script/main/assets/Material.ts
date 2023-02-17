import Pass from "../render/Pass.js";

export default class Material {
    constructor(readonly passes: Pass[]) {
    }
}