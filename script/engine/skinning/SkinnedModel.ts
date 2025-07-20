import { DescriptorSet } from "gfx";
import { MemoryView } from "../core/render/gfx/MemoryView.js";
import { Material } from "../core/render/scene/Material.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { Model } from "../core/render/scene/Model.js";
import { Transform } from "../core/render/scene/Transform.js";
import { shaderLib } from "../core/shaderLib.js";
import { Skin } from "./Skin.js";
import { SkinInstance } from "./SkinInstance.js";

const models = shaderLib.sets.instanced.uniforms.models;

export class SkinnedModel extends Model {
    static readonly descriptorSetLayout = Skin.Store.descriptorSetLayout;

    get descriptorSet(): DescriptorSet {
        return this._skin.store.descriptorSet;
    }

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: SkinInstance) {
        super(transform, mesh, materials);
    }

    override upload(properties: Readonly<Record<string, MemoryView>>) {
        this._skin.update();

        const view = properties[models.binding];
        const offset = view.addBlock(20);
        view.source.set(this._skin.root.world_matrix, offset);
        view.source[offset + 16] = this._skin.offset;
    }
}