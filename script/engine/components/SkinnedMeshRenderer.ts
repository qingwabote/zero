import { Skin } from "../assets/Skin.js";
import { Model } from "../core/render/scene/Model.js";
import { Transform } from "../core/render/scene/Transform.js";
import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";

export class SkinnedMeshRenderer extends MeshRenderer {
    public get skin(): Skin {
        return (this._model as SkinnedModel).skin;
    }
    public set skin(value: Skin) {
        (this._model as SkinnedModel).skin = value;
    }

    public get transform(): Transform {
        return this._model.transform
    }
    public set transform(value: Transform) {
        this._model.transform = value;
    }

    protected override createModel(): Model {
        return new SkinnedModel();
    }
}