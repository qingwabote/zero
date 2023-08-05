import { Pass } from "../core/render/scene/Pass.js";

export class Material {
    constructor(readonly passes: Pass[]) { }
}