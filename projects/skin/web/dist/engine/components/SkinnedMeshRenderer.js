import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";
export class SkinnedMeshRenderer extends MeshRenderer {
    get skin() {
        return this._model.skin;
    }
    set skin(value) {
        this._model.skin = value;
    }
    get transform() {
        return this._model.transform;
    }
    set transform(value) {
        this._model.transform = value;
    }
    createModel() {
        return new SkinnedModel();
    }
}
