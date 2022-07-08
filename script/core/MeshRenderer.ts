import Component from "./Component.js";
import game from "./game.js";
import Mesh from "./Mesh.js";
import Model from "./Model.js";
import Pass from "./Pass.js";
import SubModel from "./SubModel.js";

export default class MeshRenderer extends Component {
    mesh: Mesh | undefined;

    passes: Pass[] = [];

    override start(): void {
        if (!this.mesh) return;

        const subModels: SubModel[] = [];
        for (const subMesh of this.mesh.subMeshes) {
            const subModel = new SubModel(subMesh, this.passes);
            subModels.push(subModel);
        }
        const model = new Model(subModels, this._node);
        game.renderScene.models.push(model);
    }
}