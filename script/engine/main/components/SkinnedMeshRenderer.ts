import { Skin } from "../assets/Skin.js";
import { Model } from "../core/render/scene/Model.js";
import { SubModel } from "../core/render/scene/SubModel.js";
import { Transform } from "../core/render/scene/Transform.js";
import { SkinnedModel } from "./internal/SkinnedModel.js";
import { MeshRenderer } from "./MeshRenderer.js";

const emptySkin: Skin = { inverseBindMatrices: [], joints: [] };
const emptyTransform = new Transform;

export class SkinnedMeshRenderer extends MeshRenderer {
    skin: Skin = emptySkin;

    transform: Transform = emptyTransform;

    protected override createModel(subModels: SubModel[]): Model {
        return new SkinnedModel(this.transform, subModels, this.skin);
    }
}