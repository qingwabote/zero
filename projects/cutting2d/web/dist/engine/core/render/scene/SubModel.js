export class SubModel {
    get inputAssembler() {
        return this._subMesh.inputAssembler;
    }
    get drawInfo() {
        return this._subMesh.drawInfo;
    }
    constructor(_subMesh, passes) {
        this._subMesh = _subMesh;
        this.passes = passes;
    }
    update() {
        for (const pass of this.passes) {
            pass.update();
        }
    }
}
