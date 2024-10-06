import { device } from "boot";
import { CommandBuffer, DescriptorSetLayout, Filter } from "gfx";
import { Skin } from "../../assets/Skin.js";
import { mat4 } from "../../core/math/mat4.js";
import { TextureView } from "../../core/render/gpu/TextureView.js";
import { InstanceBatch } from "../../core/render/scene/InstanceBatch.js";
import { Material } from "../../core/render/scene/Material.js";
import { Mesh } from "../../core/render/scene/Mesh.js";
import { Model } from "../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { Transform } from "../../core/render/scene/Transform.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";

const SkinUniform = shaderLib.sets.local.uniforms.Skin;

const META_LENGTH = 1 /* pixels */ * 4 /* RGBA */;

const descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);

class ModelSpaceTransform {
    hasUpdatedFlag = new PeriodicFlag();
    matrix = mat4.create();
}

const mat4_a = mat4.create();

const joint2modelSpace: WeakMap<Transform, ModelSpaceTransform> = new WeakMap;

export class SkinnedModel extends Model {
    private _joints: readonly Transform[] | undefined = undefined;

    public get skin(): Skin {
        return this._skin;
    }
    public set skin(value: Skin) {
        this._skin = value;
        this._joints = undefined;
    }

    public override get transform(): Transform {
        return super.transform;
    }
    public override set transform(value: Transform) {
        super.transform = value;
        this._joints = undefined;
    }

    private _jointBuffer: Float32Array;

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: Skin) {
        super(transform, mesh, materials);
        this._jointBuffer = new Float32Array(4 * 3 * _skin.joints.length);
    }

    override upload(commandBuffer: CommandBuffer): void {
        if (this._hasUploadedFlag.value) {
            return;
        }

        super.upload(commandBuffer);

        if (!this._joints) {
            this._joints = this._skin.joints.map(paths => this.transform.getChildByPath(paths)!);
        }

        const jointBuffer = this._jointBuffer;
        for (let i = 0; i < this._joints.length; i++) {
            const joint = this._joints[i];
            this.updateModelSpace(joint);

            mat4.multiply(mat4_a, joint2modelSpace.get(joint)!.matrix, this._skin.inverseBindMatrices[i]);

            const base = 12 * i;

            jointBuffer[base + 0] = mat4_a[0];
            jointBuffer[base + 1] = mat4_a[1];
            jointBuffer[base + 2] = mat4_a[2];

            jointBuffer[base + 3] = mat4_a[12];

            jointBuffer[base + 4] = mat4_a[4];
            jointBuffer[base + 5] = mat4_a[5];
            jointBuffer[base + 6] = mat4_a[6];

            jointBuffer[base + 7] = mat4_a[13];

            jointBuffer[base + 8] = mat4_a[8];
            jointBuffer[base + 9] = mat4_a[9];
            jointBuffer[base + 10] = mat4_a[10];

            jointBuffer[base + 11] = mat4_a[14];
        }
    }

    override batch(subMeshIndex: number): InstanceBatch {
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        const joints = new TextureView(this._jointBuffer.length + META_LENGTH /* space for one instance by default */);
        joints.source[0] = 3 * this._skin.joints.length;
        descriptorSet.bindTexture(SkinUniform.binding, joints.texture, getSampler(Filter.NEAREST, Filter.NEAREST))
        return new InstanceBatch(this.mesh.subMeshes[subMeshIndex], descriptorSetLayout, descriptorSet, { [SkinUniform.binding]: joints })
    }

    override batchUpdate(batch: InstanceBatch): void {
        const joints = batch.uniforms![SkinUniform.binding];
        joints.resize(this._jointBuffer.length * (batch.count + 1) + META_LENGTH);
        joints.set(this._jointBuffer, this._jointBuffer.length * batch.count + META_LENGTH);
        super.batchUpdate(batch);
    }

    private updateModelSpace(joint: Transform) {
        let modelSpace = joint2modelSpace.get(joint);
        if (!modelSpace) {
            modelSpace = new ModelSpaceTransform;
            joint2modelSpace.set(joint, modelSpace);
        }
        if (modelSpace.hasUpdatedFlag.value) {
            return;
        }
        const parent = joint.parent!;
        if (parent == this.transform) {
            modelSpace.matrix.splice(0, joint.matrix.length, ...joint.matrix)
        } else {
            this.updateModelSpace(parent);
            mat4.multiply(modelSpace.matrix, joint2modelSpace.get(parent)!.matrix, joint.matrix)
        }
        modelSpace.hasUpdatedFlag.reset(1);
    }
}