import { Format } from "gfx";
import { Model } from "../core/render/scene/Model.js";
import { shaderLib } from "../core/shaderLib.js";
const a_skin_index = { location: shaderLib.attributes.skin_index.location, format: Format.R32_UINT /* uint16 has very bad performance on wx iOSHighPerformance+ */ };
export class SkinnedModel extends Model {
    get descriptorSet() {
        return this._skin.store.descriptorSet;
    }
    constructor(transform, mesh, materials, _skin) {
        super(transform, mesh, materials);
        this._skin = _skin;
    }
    upload(attributes) {
        this._skin.update();
        attributes[Model.a_model.location].add(this._skin.root.world_matrix);
        attributes[a_skin_index.location].addElement(this._skin.offset);
    }
}
SkinnedModel.attributes = [...Model.attributes, a_skin_index];
