import { Material } from "../assets/Material.js";
import { Mesh } from "../assets/Mesh.js";
import { Zero } from "../core/Zero.js";
import { AABB3D, aabb3d } from "../core/math/aabb3d.js";
import { vec3 } from "../core/math/vec3.js";
import { SubModel } from "../core/render/scene/SubModel.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const emptyMesh = { subMeshes: [] };

export class MeshRenderer extends BoundedRenderer {
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        vec3.set(vec3_a, ...this.mesh.subMeshes[0].vertexPositionMin);
        vec3.set(vec3_b, ...this.mesh.subMeshes[0].vertexPositionMax);
        for (let i = 1; i < this.mesh.subMeshes.length; i++) {
            vec3.min(vec3_a, vec3_a, this.mesh.subMeshes[i].vertexPositionMin);
            vec3.max(vec3_b, vec3_b, this.mesh.subMeshes[i].vertexPositionMax);
        }
        return aabb3d.fromPoints(this._bounds, vec3_a, vec3_b);
    }

    mesh: Mesh = emptyMesh;

    materials: Material[] = [];

    override start(): void {
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            this._model.subModels.push(new SubModel(this.mesh.subMeshes[i], this.materials[i].passes));
        }
        Zero.instance.scene.addModel(this._model)
    }
}