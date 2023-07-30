import { BufferUsageFlagBits } from "gfx-main";
import { Skin } from "../../assets/Skin.js";
import { mat4 } from "../../core/math/mat4.js";
import { FrameChangeRecord } from "../../core/scene/FrameChangeRecord.js";
import { Model } from "../../core/scene/Model.js";
import { SubModel } from "../../core/scene/SubModel.js";
import { Transform } from "../../core/scene/Transform.js";
import { BufferViewWritable } from "../../core/scene/buffers/BufferViewWritable.js";
import { shaderLib } from "../../core/shaderLib.js";

class ModelSpaceTransform extends FrameChangeRecord {
    matrix = mat4.create();
}

const mat4_a = mat4.create();

const joint2modelSpace: WeakMap<Transform, ModelSpaceTransform> = new WeakMap;

export class SkinnedModel extends Model {
    static readonly descriptorSetLayout = (function () {
        const layout = shaderLib.createDescriptorSetLayout([
            shaderLib.sets.local.uniforms.Local,
            shaderLib.sets.local.uniforms.Skin
        ]);
        (layout as any).name = "SkinnedModel descriptorSetLayout";
        return layout;
    })()

    private readonly _joints: readonly Transform[];

    private _skinBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Skin.length);

    constructor(transform: Transform, subModels: SubModel[], private readonly _skin: Skin) {
        super(transform, subModels);
        this._joints = _skin.joints.map(paths => transform.getChildByPath(paths)!);
        this.descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Skin.binding, this._skinBuffer.buffer);
    }

    override update(): void {
        super.update();
        for (let i = 0; i < this._joints.length; i++) {
            const joint = this._joints[i];
            this.updateModelSpace(joint);
            this._skinBuffer.set(mat4.multiply(mat4_a, joint2modelSpace.get(joint)!.matrix, this._skin.inverseBindMatrices[i]), 16 * i);
        }
        this._skinBuffer.update()
    }

    private updateModelSpace(joint: Transform) {
        let modelSpace = joint2modelSpace.get(joint);
        if (!modelSpace) {
            modelSpace = new ModelSpaceTransform;
            joint2modelSpace.set(joint, modelSpace);
        }
        if (modelSpace.hasChanged) {
            return;
        }
        const parent = joint.parent!;
        if (parent == this._transform) {
            modelSpace.matrix.splice(0, joint.matrix.length, ...joint.matrix)
        } else {
            this.updateModelSpace(parent);
            mat4.multiply(modelSpace.matrix, joint2modelSpace.get(parent)!.matrix, joint.matrix)
        }
        modelSpace.hasChanged = 1;
    }
}