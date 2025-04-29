import { pk } from "puttyknife";
import { mat4 } from "../core/math/mat4.js";
import { BlockAllocator } from "../core/render/scene/internal/BlockAllocator.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { gfxUtil } from "../gfxUtil.js";
import { Skin } from "../skinning/Skin.js";

const m_allocator = new BlockAllocator({ m: 16 });

const mat4_a = mat4.create();

interface Node {
    trs: Transform;
    children: Set<Node>;
    m: ReturnType<typeof m_allocator.alloc>['m'];
    m_view: ReturnType<typeof m_allocator.map>['m'];
}

function createNode(trs: Transform): Node {
    return { trs, children: new Set, m: null!, m_view: null! }
}

const nodeQueue: Node[] = [];

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

    private readonly _hierarchy: readonly Node[];

    constructor(readonly proto: Skin, readonly root: Transform) {
        const joints: Node[] = [];
        const hierarchy: Set<Node> = new Set;
        const trs2node: Map<Transform, Node> = new Map;
        for (let trs of proto.joints.map(paths => root.getChildByPath(paths)!)) {
            const node: Node = createNode(trs);
            trs2node.set(trs, node);
            joints.push(node);

            let child: Node | undefined;
            do {
                let node = trs2node.get(trs);
                if (!node) {
                    trs2node.set(trs, node = createNode(trs));
                }
                if (child) {
                    node.children.add(child);
                }

                child = node;
                trs = trs.parent!;
            } while (trs != root);
            hierarchy.add(child);
        }
        this._hierarchy = [...hierarchy];
        this._joints = joints;

        this.store = this.proto.alive;
    }

    update() {
        if (this._offset.value != -1) {
            return;
        }

        m_allocator.reset();
        nodeQueue.length = 0;
        for (const child of this._hierarchy) {
            child.m = child.trs.local_handle.matrix;
            child.m_view = child.trs.local_view.matrix;
            nodeQueue.push(child);
        }
        while (nodeQueue.length) {
            const node = nodeQueue.pop()!;
            for (const child of node.children) {
                const block = m_allocator.alloc()
                child.m = block.m;
                child.m_view = m_allocator.map(block).m;
                child.trs.matrix;
                // mat4.multiply_affine(child.m_view as any, node.m_view as any, child.trs.local_block_view.matrix as any);
                pk.fn.formaMat4_multiply_affine(child.m, node.m, child.trs.local_handle.matrix)
                nodeQueue.push(child);
            }
        }

        const [source, offset] = this.store.add();

        for (let i = 0; i < this._joints.length; i++) {
            mat4.multiply_affine(mat4_a, this._joints[i].m_view as any, this.proto.inverseBindMatrices[i]);
            gfxUtil.compressAffineMat4(source, 4 * 3 * i + offset, mat4_a);
        }

        this._offset.value = offset / 4;
    }
}