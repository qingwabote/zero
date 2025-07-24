import { DescriptorSet } from "gfx";
import { Material } from "../core/render/scene/Material.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { Model } from "../core/render/scene/Model.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Skin } from "./Skin.js";
import { SkinInstance } from "./SkinInstance.js";

export class SkinnedModel extends Model {
    static readonly descriptorSetLayout = Skin.Store.descriptorSetLayout;

    static readonly INSTANCE_STRIDE = 20;

    get descriptorSet(): DescriptorSet {
        return this._skin.store.descriptorSet;
    }

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: SkinInstance) {
        super(transform, mesh, materials);
    }

    upload(out: Float32Array, offset: number) {
        this._skin.update();

        out.set(this._skin.root.world_matrix, offset);
        out[offset + 16] = this._skin.offset;
    }
}