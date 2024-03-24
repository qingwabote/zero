import { Skin } from "../assets/Skin.js";
import { Model } from "../core/render/scene/Model.js";
import { Transform } from "../core/render/scene/Transform.js";
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

    private _transform: Transform | null = null;
    public get transform() {
        return this._transform
    }
    public set transform(value) {
        this._transform = value;
    }

    protected override createModel(): Model | null {
        if (!this.mesh || !this.materials || !this._transform || !this._skin) {
            return null;
        }
        return new SkinnedModel(this._transform, this.mesh, this.materials, this._skin);
    }
}