import { device } from "boot";
import { DescriptorSetLayout, Filter } from "gfx";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { TextureView } from "../../core/render/gpu/TextureView.js";
import { Material } from "../../core/render/scene/Material.js";
import { Mesh } from "../../core/render/scene/Mesh.js";
import { Model } from "../../core/render/scene/Model.js";
import { Transform } from "../../core/render/scene/Transform.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";
import { Skin } from "../../scene/Skin.js";

const SkinUniform = shaderLib.sets.local.uniforms.Skin;

const META_LENGTH = 1 /* pixels */ * 4 /* RGBA */;

const descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);

export class SkinnedModel extends Model {
    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: Skin) {
        super(transform, mesh, materials);
    }

    override batch(): Model.BatchInfo {
        const info = super.batch();
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        const joints = new TextureView(META_LENGTH);
        joints.source[0] = 3 * this._skin.joints.length;
        descriptorSet.bindTexture(SkinUniform.binding, joints.texture, getSampler(Filter.NEAREST, Filter.NEAREST))
        return {
            attributes: info.attributes,
            vertexes: info.vertexes,
            descriptorSet,
            uniforms: { [SkinUniform.binding]: joints }
        }
    }

    override batchFill(vertexes: BufferView, uniforms?: Record<string, MemoryView>) {
        super.batchFill(vertexes, uniforms);
        this._skin.update();
        uniforms![SkinUniform.binding].add(this._skin.jointData);
    }
}