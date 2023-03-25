import InputAssembler from "../gfx/InputAssembler.js";
import Pass from "./Pass.js";

export default class SubModel {
    constructor(public readonly inputAssemblers: InputAssembler[], public readonly passes: Pass[], public vertexOrIndexCount: number = 0) { }

    update() {
        for (const pass of this.passes) {
            pass.update();
        }
    }
}