import { device } from "boot";
import { Filter } from "gfx";
import { TextureView } from "../../core/render/gpu/TextureView.js";
import { Model } from "../../core/render/scene/Model.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";
const SkinUniform = shaderLib.sets.local.uniforms.Skin;
const META_LENGTH = 1 /* pixels */ * 4 /* RGBA */;
const descriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);
export class SkinnedModel extends Model {
    constructor(mesh, materials, _skin) {
        super(_skin.root, mesh, materials);
        this._skin = _skin;
    }
    batch() {
        const info = super.batch();
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        const joints = new TextureView(META_LENGTH);
        joints.source[0] = 3 * this._skin.joints.length;
        descriptorSet.bindTexture(SkinUniform.binding, joints.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        return {
            attributes: info.attributes,
            vertexes: info.vertexes,
            descriptorSet,
            uniforms: { [SkinUniform.binding]: joints }
        };
    }
    batchFill(vertexes, uniforms) {
        super.batchFill(vertexes, uniforms);
        this._skin.update();
        uniforms[SkinUniform.binding].add(this._skin.jointData);
    }
}
