import Component from "./Component.js";
import game from "./game.js";
import Material from "./Material.js";
import Mesh from "./Mesh.js";
import Model from "./Model.js";
import SubModel from "./SubModel.js";

export default class MeshRenderer extends Component {
    mesh: Mesh | undefined;

    materials: Material[] | undefined;

    override start(): void {
        if (!this.mesh) return;
        if (!this.materials) return;

        const subModels: SubModel[] = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            const subMesh = this.mesh.subMeshes[i];
            const subModel = new SubModel(subMesh, this.materials[i].passes);
            subModels.push(subModel);
        }
        const model = new Model(subModels, this._node);
        game.renderScene.models.push(model);
    }
}