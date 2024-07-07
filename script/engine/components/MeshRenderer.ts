import { AABB3D, aabb3d } from "../core/math/aabb3d.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { Model } from "../core/render/scene/Model.js";
import { Material } from "../scene/Material.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

export class MeshRenderer extends BoundedRenderer {
    private _mesh: Mesh | null = null;
    public get mesh() {
        return this._mesh
    }
    public set mesh(value) {
        this._mesh = value;
    }

    private _materials: Material[] | null = null;
    public get materials() {
        return this._materials;
    }
    public set materials(value) {
        this._materials = value;
    }

    public get bounds(): Readonly<AABB3D> {
        return this._mesh?.bounds ?? aabb3d.ZERO;
    }

    protected createModel(): Model | null {
        if (!this._mesh || !this._materials) {
            return null;
        }
        return new Model(this.node, this._mesh, this._materials);
    }
}