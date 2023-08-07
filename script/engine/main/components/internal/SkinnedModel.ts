import { BufferUsageFlagBits } from "gfx-main";
import { Skin } from "../../assets/Skin.js";
import { mat4 } from "../../core/math/mat4.js";
import { FrameChangeRecord } from "../../core/render/scene/FrameChangeRecord.js";
import { Model } from "../../core/render/scene/Model.js";
import { Transform } from "../../core/render/scene/Transform.js";
import { BufferViewWritable } from "../../core/render/scene/buffers/BufferViewWritable.js";
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

    private _joints?: readonly Transform[];

    private _skin!: Skin;
    public get skin(): Skin {
        return this._skin;
    }
    public set skin(value: Skin) {
        this._skin = value;
        this._joints = undefined;
    }

    public override set transform(value: Transform) {
        super.transform = value;
        this._joints = undefined;
    }

    private _skinBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Skin.length);

    constructor() {
        super();
        this.descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Skin.binding, this._skinBuffer.buffer);
    }

    override update(): void {
        super.update();
        if (!this._joints) {
            this._joints = this._skin.joints.map(paths => this._transform.getChildByPath(paths)!);
        }
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