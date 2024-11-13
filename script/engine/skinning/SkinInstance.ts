import { Mat4, mat4 } from "../core/math/mat4.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { gfxUtil } from "../gfxUtil.js";
import { Skin } from "../skinning/Skin.js";

const mat4_a = mat4.create();

const toModelSpace = (function () {
    interface ModelSpaceTransform {
        readonly hasUpdatedFlag: Periodic;
        readonly matrix: Mat4;
    }

    const joint2modelSpace: WeakMap<Transform, ModelSpaceTransform> = new WeakMap;
    const dirtyJoints: Transform[] = [];

    return function (root: Transform, joint: Transform) {
        let parent: Transform = joint;
        let modelSpace: ModelSpaceTransform | undefined;
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
            parent = parent.parent!;
        }

        while (i) {
            const child = dirtyJoints[--i];
            modelSpace = joint2modelSpace.get(child)!;
            if (parent == root) {
                modelSpace.matrix.splice(0, child.matrix.length, ...child.matrix);
            } else {
                mat4.multiply_affine(modelSpace.matrix, joint2modelSpace.get(parent)!.matrix, child.matrix)
            }
            modelSpace.hasUpdatedFlag.value = 1;
            parent = child;
        }

        return modelSpace!.matrix;
    }
})()

export class SkinInstance {
    public store: Skin.JointStore;

    private _offset: Periodic = new Periodic(-1, -1);
    public get offset() {
        return this._offset.value;
    }
    public set offset(value: number) {
        this._offset.value = value;
    }

    private readonly _joints: readonly Transform[];

    constructor(readonly proto: Skin, readonly root: Transform) {
        this._joints = proto.joints.map(paths => root.getChildByPath(paths)!)
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