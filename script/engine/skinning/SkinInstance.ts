import { Mat4, mat4 } from "../core/math/mat4.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { gfxUtil } from "../gfxUtil.js";
import { Skin } from "../skinning/Skin.js";

const mat4_a = mat4.create();

interface Node {
    trs: Transform;
    children: Set<Node>;
    m: Mat4;
}

export class SkinInstance {
    public store: Skin.JointStore;

    private _offset: Periodic = new Periodic(-1, -1);
    public get offset() {
        return this._offset.value;
    }
    public set offset(value: number) {
        this._offset.value = value;
    }

    private readonly _joints: readonly Node[];

    private readonly _hierarchy: Node;

    constructor(readonly proto: Skin, readonly root: Transform) {
        const joints: Node[] = [];
        const hierarchy: Node = { trs: root, children: new Set, m: mat4.create() };
        const trs2node: Map<Transform, Node> = new Map;
        for (let trs of proto.joints.map(paths => root.getChildByPath(paths)!)) {
            const node: Node = { trs, children: new Set, m: mat4.create() };
            trs2node.set(trs, node);
            joints.push(node);

            let child: Node | undefined;
            do {
                let node = trs2node.get(trs);
                if (!node) {
                    trs2node.set(trs, node = { trs, children: new Set, m: mat4.create() });
                }
                if (child) {
                    node.children.add(child);
                }

                child = node;
                trs = trs.parent!;
            } while (trs != root);
            hierarchy.children.add(child);
        }
        this._hierarchy = hierarchy;
        this._joints = joints;

        this.store = this.proto.alive;
    }

    update() {
        if (this._offset.value != -1) {
            return;
        }

        const nodeQueue: Node[] = [this._hierarchy];
        while (nodeQueue.length) {
            const node = nodeQueue.pop()!;
            for (const child of node.children) {
                nodeQueue.push(child);
                mat4.multiply_affine(child.m, node.m, child.trs.matrix);
            }
        }

        const [source, offset] = this.store.add();

        for (let i = 0; i < this._joints.length; i++) {
            mat4.multiply_affine(mat4_a, this._joints[i].m, this.proto.inverseBindMatrices[i]);
            gfxUtil.compressAffineMat4(source, 4 * 3 * i + offset, mat4_a);
        }

        this._offset.value = offset / 4;
    }
}