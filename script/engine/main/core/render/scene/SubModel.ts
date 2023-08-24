import { Pass } from "./Pass.js";
import { SubMesh } from "./SubMesh.js";

export class SubModel {
    public get inputAssembler() {
        return this._subMesh.inputAssembler;
    }

    public get drawInfo() {
        return this._subMesh.drawInfo;
    }

    constructor(private _subMesh: SubMesh, public readonly passes: Pass[]) { }

    update() {
        for (const pass of this.passes) {
            pass.update();
        }
    }
}