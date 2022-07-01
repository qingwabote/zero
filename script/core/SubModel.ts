import { InputAssembler } from "./gfx.js";
import Pass from "./Pass.js";
import SubMesh from "./SubMesh.js";

export default class SubModel {
    private _subMesh: SubMesh;
    get subMesh(): SubMesh {
        return this._subMesh;
    }

    private _passes: Pass[];
    get passes(): Pass[] {
        return this._passes;
    }

    private _inputAssembler: InputAssembler;
    get inputAssembler(): InputAssembler {
        return this._inputAssembler;
    }

    constructor(subMesh: SubMesh, passes: Pass[], inputAssembler: InputAssembler) {
        this._subMesh = subMesh;
        this._passes = passes;
        this._inputAssembler = inputAssembler;
    }
}