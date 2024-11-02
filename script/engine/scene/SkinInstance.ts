import { Mat4, mat4 } from "../core/math/mat4.js";
import { PeriodicFlag } from "../core/render/scene/PeriodicFlag.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Skin } from "./Skin.js";

const mat4_a = mat4.create();

const toModelSpace = (function () {
    interface ModelSpaceTransform {
        readonly hasUpdatedFlag: PeriodicFlag;
        readonly matrix: Mat4;
    }

    const joint2modelSpace: WeakMap<Transform, ModelSpaceTransform> = new WeakMap;
    const dirtyJoints: Transform[] = [];

    return function (root: Transform, joint: Transform) {
        let cur: Transform = joint;
        let modelSpace: ModelSpaceTransform | undefined;
        let i = 0;

        while (cur != root) {
            modelSpace = joint2modelSpace.get(cur);
            if (!modelSpace) {
                joint2modelSpace.set(cur, modelSpace = { hasUpdatedFlag: new PeriodicFlag, matrix: mat4.create() });
            }
            if (modelSpace.hasUpdatedFlag.value) {
                break;
            }

            dirtyJoints[i++] = cur;
            cur = cur.parent!;
        }

        while (i) {
            const child = dirtyJoints[--i];
            modelSpace = joint2modelSpace.get(child)!;
            if (cur == root) {
                modelSpace.matrix.splice(0, child.matrix.length, ...child.matrix);
            } else {
                mat4.multiply_affine(modelSpace.matrix, joint2modelSpace.get(cur)!.matrix, child.matrix)
            }
            modelSpace.hasUpdatedFlag.reset(1);
            cur = child;
        }

        return modelSpace!.matrix;
    }
})()

export class SkinInstance {
    readonly joints: readonly Transform[];

    readonly jointData: Float32Array;

    private _hasUpdatedFlag = new PeriodicFlag;

    constructor(readonly root: Transform, private readonly _proto: Skin) {
        this.joints = _proto.joints.map(paths => root.getChildByPath(paths)!)
        this.jointData = new Float32Array(4 * 3 * _proto.joints.length);
    }

    update() {
        if (this._hasUpdatedFlag.value) {
            return;
        }

        const jointData = this.jointData;
        for (let i = 0; i < this.joints.length; i++) {
            mat4.multiply_affine(mat4_a, toModelSpace(this.root, this.joints[i]), this._proto.inverseBindMatrices[i]);

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

    upload() {

    }
}