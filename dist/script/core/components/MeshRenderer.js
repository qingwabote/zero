import Component from "../Component.js";
import game from "../game.js";
import Model from "../render/Model.js";
import SubModel from "../render/SubModel.js";
export default class MeshRenderer extends Component {
    mesh;
    materials;
    start() {
        if (!this.mesh)
            return;
        if (!this.materials)
            return;
        const subModels = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            const subMesh = this.mesh.subMeshes[i];
            const subModel = new SubModel(subMesh, this.materials[i].passes);
            subModels.push(subModel);
        }
        const model = new Model(subModels, this._node);
        game.renderScene.models.push(model);
    }
}
//# sourceMappingURL=MeshRenderer.js.map