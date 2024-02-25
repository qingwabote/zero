import { Pass } from "./Pass.js";

export class Material {
    constructor(readonly passes: Pass[]) { }
}