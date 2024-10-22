import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";
export class SkinnedMeshRenderer extends MeshRenderer {
    constructor() {
        super(...arguments);
        this._skin = null;
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        this._skin = value;
    }
    createModel() {
        if (!this.mesh || !this.materials || !this._skin) {
            return null;
        }
        return new SkinnedModel(this.mesh, this.materials, this._skin);
    }
}
