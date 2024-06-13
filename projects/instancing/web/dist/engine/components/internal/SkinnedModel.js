import { BufferUsageFlagBits } from "gfx";
import { mat4 } from "../../core/math/mat4.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Model } from "../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../core/shaderLib.js";
class ModelSpaceTransform {
    constructor() {
        this.hasUpdated = new PeriodicFlag();
        this.matrix = mat4.create();
    }
}
const mat4_a = mat4.create();
const joint2modelSpace = new WeakMap;
export class SkinnedModel extends Model {
    get skin() {
        return this._skin;
    }
    set skin(value) {
        this._skin = value;
        this._joints = undefined;
    }
    get transform() {
        return super.transform;
    }
    set transform(value) {
        super.transform = value;
        this._joints = undefined;
    }
    constructor(transform, mesh, materials, _skin) {
        super(transform, mesh, materials);
        this._skin = _skin;
        this._joints = undefined;
        const view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Skin.length);
        this.descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Skin.binding, view.buffer);
        this._skinBuffer = view;
    }
    upload() {
        if (this._hasUploaded.value) {
            return;
        }
        super.upload();
        if (!this._joints) {
            this._joints = this._skin.joints.map(paths => this.transform.getChildByPath(paths));
        }
        for (let i = 0; i < this._joints.length; i++) {
            const joint = this._joints[i];
            this.updateModelSpace(joint);
            this._skinBuffer.set(mat4.multiply(mat4_a, joint2modelSpace.get(joint).matrix, this._skin.inverseBindMatrices[i]), 16 * i);
        }
        this._skinBuffer.update();
    }
    updateModelSpace(joint) {
        let modelSpace = joint2modelSpace.get(joint);
        if (!modelSpace) {
            modelSpace = new ModelSpaceTransform;
            joint2modelSpace.set(joint, modelSpace);
        }
        if (modelSpace.hasUpdated.value) {
            return;
        }
        const parent = joint.parent;
        if (parent == this.transform) {
            modelSpace.matrix.splice(0, joint.matrix.length, ...joint.matrix);
        }
        else {
            this.updateModelSpace(parent);
            mat4.multiply(modelSpace.matrix, joint2modelSpace.get(parent).matrix, joint.matrix);
        }
        modelSpace.hasUpdated.reset(1);
    }
}
SkinnedModel.descriptorSetLayout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Skin]);
