import { pk } from "puttyknife";
import { BlockAllocator } from "../core/BlockAllocator.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Skin } from "../skinning/Skin.js";

const matrix_allocator = new BlockAllocator({ matrix: 16 });

interface Node {
    local: Transform.Local;
    children: Set<Node>;
    matrix: ReturnType<typeof matrix_allocator.alloc>['matrix'];
}

function createNode(local: Transform.Local): Node {
    return { local, children: new Set, matrix: null! }
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
            const node: Node = createNode(trs.local);
            trs2node.set(trs, node);
            joints.push(node);

            let child: Node | undefined;
            do {
                let node = trs2node.get(trs);
                if (!node) {
                    trs2node.set(trs, node = createNode(trs.local));
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

        matrix_allocator.reset();

        const temp_block = matrix_allocator.alloc();
        const temp_mat4_handle = temp_block.matrix;
        const temp_mat4_view = matrix_allocator.map(temp_block).matrix;

        nodeQueue.length = 0;
        for (const child of this._hierarchy) {
            child.matrix = matrix_allocator.alloc().matrix;
            pk.fn.formaMat4_fromTRS(child.matrix, child.local.position, child.local.rotation, child.local.scale);
            nodeQueue.push(child);
        }
        while (nodeQueue.length) {
            const node = nodeQueue.pop()!;
            for (const child of node.children) {
                child.matrix = matrix_allocator.alloc().matrix;
                pk.fn.formaMat4_multiply_affine_TRS(child.matrix, node.matrix, child.local.position, child.local.rotation, child.local.scale)
                nodeQueue.push(child);
            }
        }

        const offset = this.store.add();
        for (let i = 0; i < this._joints.length; i++) {
            pk.fn.formaMat4_multiply_affine(temp_mat4_handle, this._joints[i].matrix, this.proto.inverseBindMatrices[i]);
            pk.fn.formaMat4_to3x4(pk.heap.locBuffer(this.store.handle, (4 * 3 * i + offset) * 4), temp_mat4_handle);
            // gfxUtil.compressAffineMat4(this.store.source, 4 * 3 * i + offset, temp_mat4_view as any);
        }

        this._offset.value = offset / 4;
    }
}