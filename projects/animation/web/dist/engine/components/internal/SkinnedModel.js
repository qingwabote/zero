import { BufferUsageFlagBits } from "gfx";
import { mat4 } from "../../core/math/mat4.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Model } from "../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../core/shaderLib.js";
class ModelSpaceTransform {
    constructor() {
        this.hasUpdatedFlag = new PeriodicFlag();
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
        if (this._hasUploadedFlag.value) {
            return;
        }
        super.upload();
        if (!this._joints) {
            this._joints = this._skin.joints.map(paths => this.transform.getChildByPath(paths));
        }
        const source = this._skinBuffer.source;
        for (let i = 0; i < this._joints.length; i++) {
            const joint = this._joints[i];
            this.updateModelSpace(joint);
            mat4.multiply(mat4_a, joint2modelSpace.get(joint).matrix, this._skin.inverseBindMatrices[i]);
            const base = 12 * i;
            source[base + 0] = mat4_a[0];
            source[base + 1] = mat4_a[1];
            source[base + 2] = mat4_a[2];
            source[base + 3] = mat4_a[12];
            source[base + 4] = mat4_a[4];
            source[base + 5] = mat4_a[5];
            source[base + 6] = mat4_a[6];
            source[base + 7] = mat4_a[13];
            source[base + 8] = mat4_a[8];
            source[base + 9] = mat4_a[9];
            source[base + 10] = mat4_a[10];
            source[base + 11] = mat4_a[14];
        }
        this._skinBuffer.invalidate();
        this._skinBuffer.update();
    }
    updateModelSpace(joint) {
        let modelSpace = joint2modelSpace.get(joint);
        if (!modelSpace) {
            modelSpace = new ModelSpaceTransform;
            joint2modelSpace.set(joint, modelSpace);
        }
        if (modelSpace.hasUpdatedFlag.value) {
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
        modelSpace.hasUpdatedFlag.reset(1);
    }
}
SkinnedModel.descriptorSetLayout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Skin]);
