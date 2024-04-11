import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";
export class SkinnedMeshRenderer extends MeshRenderer {
    constructor() {
        super(...arguments);
        this._skin = null;
        this._transform = null;
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        this._skin = value;
    }
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
    }
    createModel() {
        if (!this.mesh || !this.materials || !this._transform || !this._skin) {
            return null;
        }
        return new SkinnedModel(this._transform, this.mesh, this.materials, this._skin);
    }
}
