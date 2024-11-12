import { DescriptorSet, Format } from "gfx";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { Material } from "../../core/render/scene/Material.js";
import { Mesh } from "../../core/render/scene/Mesh.js";
import { Model } from "../../core/render/scene/Model.js";
import { Transform } from "../../core/render/scene/Transform";
import { shaderLib } from "../../core/shaderLib.js";
import { SkinInstance } from "../../scene/SkinInstance.js";

const a_skin_index: Model.InstancedAttribute = { location: shaderLib.attributes.skin_index.location, format: Format.R32_UINT /* uint16 has very bad performance on wx iOSHighPerformance+ */ }

export class SkinnedModel extends Model {
    static readonly attributes: readonly Model.InstancedAttribute[] = [...Model.attributes, a_skin_index];

    get descriptorSet(): DescriptorSet {
        return this._skin.descriptorSet;
    }

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: SkinInstance) {
        super(transform, mesh, materials);
    }

    override upload(attributes: Readonly<Record<string, MemoryView>>) {
        this._skin.update();
        attributes[Model.a_model.location].add(this._skin.root.world_matrix)
        attributes[a_skin_index.location].addElement(this._skin.offset)
    }
}