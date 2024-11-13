import { MeshRenderer } from "../components/MeshRenderer.js";
import { SkinnedModel } from "./SkinnedModel.js";
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
        return new SkinnedModel(this.node, this.mesh, this.materials, this._skin);
    }
    upload(commandBuffer) {
        var _a;
        (_a = this._skin) === null || _a === void 0 ? void 0 : _a.store.upload(commandBuffer);
    }
}
