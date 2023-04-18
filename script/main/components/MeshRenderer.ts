import Material from "../assets/Material.js";
import Mesh from "../assets/Mesh.js";
import aabb3d, { AABB3D } from "../core/math/aabb3d.js";
import vec3 from "../core/math/vec3.js";
import Model from "../core/scene/Model.js";
import SubModel from "../core/scene/SubModel.js";
import BoundedRenderer from "./internal/BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const emptyMesh = { subMeshes: [] };

export default class MeshRenderer extends BoundedRenderer {
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        vec3.set(vec3_a, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
        vec3.set(vec3_b, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)
        for (const subMesh of this.mesh.subMeshes) {
            vec3.min(vec3_a, vec3_a, subMesh.vertexPositionMin);
            vec3.max(vec3_b, vec3_b, subMesh.vertexPositionMax);
        }
        return aabb3d.fromPoints(this._bounds, vec3_a, vec3_b);
    }

    mesh: Mesh = emptyMesh;

    materials: Material[] = [];

    private _model!: Model;

    override start(): void {
        const subModels: SubModel[] = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            subModels.push(new SubModel(this.mesh.subMeshes[i], this.materials[i].passes));
        }
        const model = this.createModel(subModels);
        zero.scene.models.push(model);
        this._model = model;
    }

    protected createModel(subModels: SubModel[]) {
        return new Model(this.node, subModels);
    }
}