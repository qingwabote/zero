import { Model } from "../core/render/scene/Model.js";
import { Skin } from "../scene/Skin.js";
import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";

export class SkinnedMeshRenderer extends MeshRenderer {

    private _skin: Skin | null = null;
    public get skin() {
        return this._skin;
    }
    public set skin(value) {
        this._skin = value;
    }

    protected override createModel(): Model | null {
        if (!this.mesh || !this.materials || !this._skin) {
            return null;
        }
        return new SkinnedModel(this.mesh, this.materials, this._skin);
    }
}