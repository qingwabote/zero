import SubMesh from "./SubMesh.js";

export default class Mesh {
    private _subMeshes: SubMesh[];
    get subMeshes(): SubMesh[] {
        return this._subMeshes
    }

    constructor(subMeshes: SubMesh[]) {
        this._subMeshes = subMeshes;
    }
}