import { Zero } from "../core/Zero.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

export class MeshRenderer extends BoundedRenderer {
    public get mesh() {
        return this._model.mesh;
    }
    public set mesh(value) {
        this._model.mesh = value;
    }

    public get materials() {
        return this._model.materials;
    }
    public set materials(value) {
        this._model.materials = value;
    }

    override start(): void {
        Zero.instance.scene.addModel(this._model)
    }
}