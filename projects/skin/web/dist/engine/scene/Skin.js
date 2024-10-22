import { mat4 } from "../core/math/mat4.js";
import { PeriodicFlag } from "../core/render/scene/PeriodicFlag.js";
const mat4_a = mat4.create();
const toModelSpace = (function () {
    const joint2modelSpace = new WeakMap;
    const dirtyJoints = [];
    return function (root, joint) {
        let cur = joint;
        let modelSpace;
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
            cur = cur.parent;
        }
        while (i) {
            const child = dirtyJoints[--i];
            modelSpace = joint2modelSpace.get(child);
            if (cur == root) {
                modelSpace.matrix.splice(0, child.matrix.length, ...child.matrix);
            }
            else {
                mat4.multiply_affine(modelSpace.matrix, joint2modelSpace.get(cur).matrix, child.matrix);
            }
            modelSpace.hasUpdatedFlag.reset(1);
            cur = child;
        }
        return modelSpace.matrix;
    };
})();
export class Skin {
    get jointData() {
        return this._jointData;
    }
    constructor(root, joints, _inverseBindMatrices) {
        this.root = root;
        this.joints = joints;
        this._inverseBindMatrices = _inverseBindMatrices;
        this._hasUpdatedFlag = new PeriodicFlag;
        this._jointData = new Float32Array(4 * 3 * joints.length);
    }
    update() {
        if (this._hasUpdatedFlag.value) {
            return;
        }
        const jointData = this._jointData;
        for (let i = 0; i < this.joints.length; i++) {
            mat4.multiply(mat4_a, toModelSpace(this.root, this.joints[i]), this._inverseBindMatrices[i]);
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
}
