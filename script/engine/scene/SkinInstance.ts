import { CommandBuffer } from "gfx";
import { Mat4, mat4 } from "../core/math/mat4.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { gfxUtil } from "../gfxUtil.js";
import { Skin } from "./Skin.js";

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
    get descriptorSet() {
        return this._proto.alive.descriptorSet;
    }

    private _indexFlag: Periodic = new Periodic(-1, -1);
    get index() {
        return this._indexFlag.value;
    }

    private readonly _joints: readonly Transform[];

    private readonly _jointData: Float32Array;

    constructor(readonly root: Transform, private readonly _proto: Skin) {
        this._joints = _proto.joints.map(paths => root.getChildByPath(paths)!)
        this._jointData = new Float32Array(4 * 3 * _proto.joints.length);
    }

    update() {
        if (this._indexFlag.value != -1) {
            return;
        }

        const jointData = this._jointData;
        for (let i = 0; i < this._joints.length; i++) {
            mat4.multiply_affine(mat4_a, toModelSpace(this.root, this._joints[i]), this._proto.inverseBindMatrices[i]);
            gfxUtil.compressAffineMat4(jointData, 12 * i, mat4_a)
        }

        this._indexFlag.value = this._proto.alive.add(jointData);
    }

    upload(commandBuffer: CommandBuffer) {
        this._proto.alive.upload(commandBuffer);
    }
}