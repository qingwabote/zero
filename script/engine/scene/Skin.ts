import { mat4, Mat4Like } from "../core/math/mat4.js";
import { PeriodicFlag } from "../core/render/scene/PeriodicFlag.js";
import { Transform } from "../core/render/scene/Transform.js";

class ModelSpaceTransform {
    hasUpdatedFlag = new PeriodicFlag();
    matrix = mat4.create();
}

const joint2modelSpace: WeakMap<Transform, ModelSpaceTransform> = new WeakMap;

const mat4_a = mat4.create();

export class Skin {
    private _jointData: Float32Array;
    public get jointData(): ArrayLike<number> {
        return this._jointData;
    }

    private _hasUpdatedFlag = new PeriodicFlag;

    constructor(private readonly _root: Transform, readonly joints: readonly Transform[], private readonly _inverseBindMatrices: readonly Readonly<Mat4Like>[]) {
        this._jointData = new Float32Array(4 * 3 * joints.length);
    }

    update() {
        if (this._hasUpdatedFlag.value) {
            return;
        }

        const jointData = this._jointData;
        for (let i = 0; i < this.joints.length; i++) {
            const joint = this.joints[i];
            this.updateModelSpace(joint);

            mat4.multiply(mat4_a, joint2modelSpace.get(joint)!.matrix, this._inverseBindMatrices[i]);

            const base = 12 * i;

            jointData[base + 0] = mat4_a[0];
            jointData[base + 1] = mat4_a[1];
            jointData[base + 2] = mat4_a[2];

            jointData[base + 3] = mat4_a[12];

            jointData[base + 4] = mat4_a[4];
            jointData[base + 5] = mat4_a[5];
            jointData[base + 6] = mat4_a[6];

            jointData[base + 7] = mat4_a[13];

            jointData[base + 8] = mat4_a[8];
            jointData[base + 9] = mat4_a[9];
            jointData[base + 10] = mat4_a[10];

            jointData[base + 11] = mat4_a[14];
        }
        this._hasUpdatedFlag.reset(1);
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
        if (parent == this._root) {
            modelSpace.matrix.splice(0, joint.matrix.length, ...joint.matrix)
        } else {
            this.updateModelSpace(parent);
            mat4.multiply(modelSpace.matrix, joint2modelSpace.get(parent)!.matrix, joint.matrix)
        }
        modelSpace.hasUpdatedFlag.reset(1);
    }
}