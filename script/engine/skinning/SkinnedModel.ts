import { DescriptorSet, Format } from "gfx";
import { MemoryView } from "../core/render/gfx/MemoryView.js";
import { Material } from "../core/render/scene/Material.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { Model } from "../core/render/scene/Model.js";
import { Transform } from "../core/render/scene/Transform.js";
import { shaderLib } from "../core/shaderLib.js";
import { Skin } from "./Skin.js";
import { SkinInstance } from "./SkinInstance.js";

const a_jointOffset: Model.InstancedAttribute = { location: shaderLib.attributes.jointOffset.location, format: Format.R32_UINT /* uint16 has very bad performance on wx iOSHighPerformance+ */ }

export class SkinnedModel extends Model {
    static readonly attributes: readonly Model.InstancedAttribute[] = [...Model.attributes, a_jointOffset];

    static readonly descriptorSetLayout = Skin.Store.descriptorSetLayout;

    get descriptorSet(): DescriptorSet {
        return this._skin.store.descriptorSet;
    }

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: SkinInstance) {
        super(transform, mesh, materials);
    }

    override upload(attributes: Readonly<Record<string, MemoryView>>) {
        this._skin.update();
        attributes[a_jointOffset.location].addElement(this._skin.offset)
        attributes[Model.a_model.location].add(this._skin.root.world_matrix)
    }
}