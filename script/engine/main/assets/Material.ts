import { Pass } from "../core/scene/Pass.js";

export class Material {
    constructor(readonly passes: Pass[]) { }
}