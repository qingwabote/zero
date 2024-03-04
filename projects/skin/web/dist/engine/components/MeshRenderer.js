import { Zero } from "../core/Zero.js";
import { BoundedRenderer } from "./BoundedRenderer.js";
export class MeshRenderer extends BoundedRenderer {
    get mesh() {
        return this._model.mesh;
    }
    set mesh(value) {
        this._model.mesh = value;
    }
    get materials() {
        return this._model.materials;
    }
    set materials(value) {
        this._model.materials = value;
    }
    start() {
        Zero.instance.scene.addModel(this._model);
    }
}
