import { DescriptorSet, Format } from "gfx";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { Material } from "../../core/render/scene/Material.js";
import { Mesh } from "../../core/render/scene/Mesh.js";
import { Model } from "../../core/render/scene/Model.js";
import { shaderLib } from "../../core/shaderLib.js";
import { SkinInstance } from "../../scene/SkinInstance.js";

const a_skin_index: Model.InstancedAttribute = { location: shaderLib.attributes.skin_index.location, format: Format.R32_UINT /* uint16 has very bad performance on wx iOSHighPerformance+ */ }

export class SkinnedModel extends Model {
    static readonly attributes: readonly Model.InstancedAttribute[] = [...Model.attributes, a_skin_index];

    get descriptorSet(): DescriptorSet {
        return this._skin.descriptorSet;
    }

    constructor(mesh: Mesh, materials: readonly Material[], private _skin: SkinInstance) {
        super(_skin.root, mesh, materials);
    }

    override upload(attributes: Readonly<Record<string, MemoryView>>) {
        super.upload(attributes);
        this._skin.update();
        attributes[a_skin_index.location].addElement(this._skin.index)
    }
}