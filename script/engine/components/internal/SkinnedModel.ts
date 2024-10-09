import { device } from "boot";
import { DescriptorSetLayout, Filter } from "gfx";
import { Skin } from "../../assets/Skin.js";
import { mat4 } from "../../core/math/mat4.js";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { TextureView } from "../../core/render/gpu/TextureView.js";
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
    private _joints: readonly Transform[] | null = null;

    public get skin(): Skin {
        return this._skin;
    }
    public set skin(value: Skin) {
        this._skin = value;
        this._joints = null;
    }

    public override get transform(): Transform {
        return super.transform;
    }
    public override set transform(value: Transform) {
        super.transform = value;
        this._joints = null;
    }

    private _jointBuffer: Float32Array;
    private _jointBufferHasUpdatedFlag = new PeriodicFlag;

    constructor(transform: Transform, mesh: Mesh, materials: readonly Material[], private _skin: Skin) {
        super(transform, mesh, materials);
        this._jointBuffer = new Float32Array(4 * 3 * _skin.joints.length);
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
        if (!this._jointBufferHasUpdatedFlag.value) {
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
            this._jointBufferHasUpdatedFlag.reset(1);
        }
        uniforms![SkinUniform.binding].add(this._jointBuffer);
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