import { mat4 } from "../core/math/mat4.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { gfxUtil } from "../gfxUtil.js";
const mat4_a = mat4.create();
const toModelSpace = (function () {
    const joint2modelSpace = new WeakMap;
    const dirtyJoints = [];
    return function (root, joint) {
        let parent = joint;
        let modelSpace;
        let i = 0;
        while (parent != root) {
            modelSpace = joint2modelSpace.get(parent);
            if (!modelSpace) {
                joint2modelSpace.set(parent, modelSpace = { hasUpdatedFlag: new Periodic(0, 0), matrix: mat4.create() });
            }
            if (modelSpace.hasUpdatedFlag.value) {
                break;
            }
            dirtyJoints[i++] = parent;
            parent = parent.parent;
        }
        while (i) {
            const child = dirtyJoints[--i];
            modelSpace = joint2modelSpace.get(child);
            if (parent == root) {
                modelSpace.matrix.splice(0, child.matrix.length, ...child.matrix);
            }
            else {
                mat4.multiply_affine(modelSpace.matrix, joint2modelSpace.get(parent).matrix, child.matrix);
            }
            modelSpace.hasUpdatedFlag.value = 1;
            parent = child;
        }
        return modelSpace.matrix;
    };
})();
export class SkinInstance {
    get offset() {
        return this._offset.value;
    }
    set offset(value) {
        this._offset.value = value;
    }
    constructor(proto, root) {
        this.proto = proto;
        this.root = root;
        this._offset = new Periodic(-1, -1);
        this._joints = proto.joints.map(paths => root.getChildByPath(paths));
        this.store = this.proto.alive;
    }
    update() {
        if (this._offset.value != -1) {
            return;
        }
        const [source, offset] = this.store.add();
        for (let i = 0; i < this._joints.length; i++) {
            mat4.multiply_affine(mat4_a, toModelSpace(this.root, this._joints[i]), this.proto.inverseBindMatrices[i]);
            gfxUtil.compressAffineMat4(source, 4 * 3 * i + offset, mat4_a);
        }
        this._offset.value = offset / 4;
    }
}
