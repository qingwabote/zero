import { pk } from "puttyknife";
import { BlockAllocator } from "../core/BlockAllocator.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Transient } from "../core/render/scene/Transient.js";
import { Skin } from "../skinning/Skin.js";

const matrix_allocator = new BlockAllocator({ matrix: 16 });

interface Node {
    local: Transform.Local;
    parent: number;
}

const matrixes: ReturnType<typeof matrix_allocator.alloc>['matrix'][] = [];

export class SkinInstance {
    public store: Skin.Store;

    private readonly _offset: Transient = new Transient(-1, -1);
    public get offset() {
        return this._offset.value;
    }
    public set offset(value: number) {
        this._offset.value = value;
    }

    readonly updated: Transient = new Transient(0, 0);

    private readonly _nodes: readonly Node[];
    private readonly _joints: number;

    constructor(readonly proto: Skin, readonly root: Transform) {
        // assume proto.joints are topologically sorted (though not required by glTF spec)
        const nodes: Node[] = [];
        let parent = root;
        for (let i = 0; i < proto.joints[0].length - 1; i++) {
            const name = proto.joints[0][i];
            let err = true;
            for (const child of parent.children) {
                if (child.name == name) {
                    nodes.push({ local: child.local, parent: nodes.length - 1 })
                    parent = child;
                    err = false;
                    break;
                }
            }
            if (err) {
                throw new Error(`${name} not exists`);
            }
        }
        this._joints = nodes.length;
        for (const path of proto.joints) {
            const child = root.getChildByPath(path)!
            let parent = nodes.length - 1;
            for (; parent > -1; parent--) {
                if (nodes[parent].local == child.parent!.local) {
                    break;
                }
            }
            if (parent == -1) {
                throw new Error(`parent not exists`);
            }
            const node = { local: child.local, matrix: null!, parent }
            nodes.push(node);
        }
        this._nodes = nodes;

        this.store = this.proto.transient;
    }

    alloc() {
        return this._offset.value = this.store.add();
    }

    update() {
        if (this.updated.value != 0) {
            return;
        }

        if (this._offset.value == -1) {
            this.alloc();
        } else {
            this.store.invalidate(this._offset.value);
        }

        matrix_allocator.reset();

        const temp_block = matrix_allocator.alloc();
        const temp_mat4_handle = temp_block.matrix;

        for (let i = 0; i < this._nodes.length; i++) {
            const node = this._nodes[i];
            const matrix = matrix_allocator.alloc().matrix;
            if (node.parent == -1) {
                pk.fn.formaMat4_fromTRS(matrix, node.local.position, node.local.rotation, node.local.scale);
            } else {
                pk.fn.formaMat4_multiply_affine_TRS(matrix, matrixes[node.parent], node.local.position, node.local.rotation, node.local.scale)
            }
            matrixes[i] = matrix;
        }

        for (let i = 0; i < this.proto.joints.length; i++) {
            pk.fn.formaMat4_multiply_affine(temp_mat4_handle, matrixes[i + this._joints], this.proto.inverseBindMatrices[i]);
            pk.fn.formaMat4_to3x4(this.store.handle, 4 * 3 * i + this._offset.value, temp_mat4_handle);
        }

        this.updated.value = 1;
    }
}