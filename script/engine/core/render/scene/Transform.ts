import { pk } from "puttyknife";
import { BlockAllocator } from "../../BlockAllocator.js";
import { TRS } from "../../math/TRS.js";
import { Mat4, Mat4Like, mat4 } from "../../math/mat4.js";
import { Quat, QuatLike, quat } from "../../math/quat.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { Transient } from "./Transient.js";

const vec3_a = vec3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();

const mat4_handle_a = pk.heap.newBuffer(16 * 4, 0);

const dirtyTransforms: Transform[] = [];

const local_allocator = new BlockAllocator({
    position: 3,
    rotation: 4,
    scale: 3,
});

type Local = ReturnType<typeof local_allocator.alloc>;

const world_allocator = new BlockAllocator({
    position: 3,
    rotation: 4,
    scale: 3,
    matrix: 16,
});

export class Transform implements TRS {

    public readonly local: Local;
    private readonly _local_view: ReturnType<typeof local_allocator.map>;

    get position(): Readonly<Vec3> {
        return this._local_view.position as any
    }
    set position(value: Readonly<Vec3Like>) {
        vec3.copy(this._local_view.position as any, value)
        this.invalidate();
    }

    /**
     * rotation is normalized.
     */
    get rotation(): Readonly<Quat> {
        return this._local_view.rotation as any;
    }
    set rotation(value: Readonly<QuatLike>) {
        vec4.copy(this._local_view.rotation as any, value)
        this.invalidate();
    }

    get scale(): Readonly<Vec3> {
        return this._local_view.scale as any;
    }
    set scale(value: Readonly<Vec3Like>) {
        vec3.copy(this._local_view.scale as any, value)
        this.invalidate();
    }

    private _euler = vec3.create();
    get euler(): Readonly<Vec3> {
        return quat.toEuler(this._euler, this.rotation);
    }
    set euler(value: Readonly<Vec3Like>) {
        quat.fromEuler(this.rotation, value[0], value[1], value[2]);
        this.invalidate();
    }

    public set matrix(value: Readonly<Mat4Like>) {
        mat4.toTRS(value, this.position, this.rotation, this.scale);
        this.invalidate();
    }

    private _world: ReturnType<typeof world_allocator.alloc>;
    private _world_view: ReturnType<typeof world_allocator.map>;
    private _world_invalidated = false;

    get world_position(): Readonly<Vec3> {
        this.world_update();
        return this._world_view.position as any;
    }
    set world_position(value: Readonly<Vec3Like>) {
        if (!this._parent) {
            this.position = value;
            return;
        }

        mat4.invert(mat4_a, this._parent.world_matrix);
        vec3.transformMat4(this.position, value, mat4_a);
        this.invalidate();
    }

    get world_rotation(): Readonly<Quat> {
        this.world_update();
        return this._world_view.rotation as any;
    }
    set world_rotation(value: Readonly<QuatLike>) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }

        quat.conjugate(this.rotation, this._parent.world_rotation);
        quat.multiply(this.rotation, this.rotation, value);
        this.invalidate();
    }

    public get world_scale(): Readonly<Vec3> {
        this.world_update();
        return this._world_view.scale as any;
    }

    get world_matrix(): Readonly<Mat4> {
        this.world_update();
        return this._world_view.matrix as any;
    }

    private _children: this[] = [];
    get children(): readonly this[] {
        return this._children;
    }

    private _parent?: this = undefined;
    get parent(): this | undefined {
        return this._parent;
    }

    private _hasChangedFlag = new Transient(1, 0);
    get hasChangedFlag(): Readonly<Transient> {
        return this._hasChangedFlag;
    }

    private _vis_exp?: number = undefined;
    private _vis_imp: number | undefined = undefined;
    public get visibility(): number {
        return this._vis_exp ?? this._vis_imp ?? (this._vis_imp = this._parent?.visibility) ?? 0;
    }
    public set visibility(value) {
        const stack = [...this.children];
        let child;
        while (child = stack.pop()) {
            if (child._vis_exp != undefined) {
                continue;
            }
            child._vis_imp = value;
            stack.push(...child.children);
        }
        this._vis_exp = value;
    }

    constructor(public readonly name: string = '') {
        const local = local_allocator.alloc();
        const local_view = local_allocator.map(local);
        local_view.position.set(vec3.ZERO);
        local_view.rotation.set(quat.IDENTITY);
        local_view.scale.set(vec3.ONE);
        this._local_view = local_view;
        this.local = local;

        const world = world_allocator.alloc();
        const world_view = world_allocator.map(world);
        world_view.position.set(vec3.ZERO);
        world_view.rotation.set(quat.IDENTITY);
        world_view.scale.set(vec3.ONE);
        world_view.matrix.set(mat4.IDENTITY);
        this._world_view = world_view;
        this._world = world;
    }

    addChild(child: this): void {
        child._vis_imp = undefined;
        child._parent = this;
        child.invalidate();

        this._children.push(child);
    }

    getChildByPath(paths: readonly string[]): this | undefined {
        let current: this | undefined = this;
        for (const path of paths) {
            if (!current) {
                break;
            }
            const children: readonly this[] = current.children;
            current = undefined;
            for (const child of children) {
                if (child.name == path) {
                    current = child;
                    break;
                }
            }
        }
        return current;
    }

    // https://medium.com/@carmencincotti/lets-look-at-magic-lookat-matrices-c77e53ebdf78
    lookAt(tar: Readonly<Vec3>) {
        vec3.subtract(vec3_a, this.world_position, tar);
        vec3.normalize(vec3_a, vec3_a);
        quat.fromViewUp(quat_a, vec3_a);
        this.world_rotation = quat_a;
    }

    private invalidate(): void {
        let i = 0;
        dirtyTransforms[i++] = this;

        while (i) {
            let cur = dirtyTransforms[--i];
            if (cur._world_invalidated) {
                continue;
            }
            cur._world_invalidated = true;
            cur._hasChangedFlag.value = 1;
            for (const child of cur._children) {
                dirtyTransforms[i++] = child;
            }
        }
    }

    private world_update(): void {
        let i = 0;
        let cur: Transform | undefined = this;
        while (cur) {
            if (!cur._world_invalidated) {
                break;
            }

            dirtyTransforms[i++] = cur;
            cur = cur.parent;
        }

        while (i) {
            const child = dirtyTransforms[--i];
            if (cur) {
                pk.fn.formaMat4_fromTRS(mat4_handle_a, child.local.position, child.local.rotation, child.local.scale);
                pk.fn.formaMat4_multiply_affine(child._world.matrix, cur._world.matrix, mat4_handle_a);
                mat4.toTRS(child._world_view.matrix as any, child._world_view.position as any, child._world_view.rotation as any, child._world_view.scale as any);
            } else {
                child._world_view.position.set(child._local_view.position)
                child._world_view.rotation.set(child._local_view.rotation)
                child._world_view.scale.set(child._local_view.scale)
                pk.fn.formaMat4_fromTRS(child._world.matrix, child.local.position, child.local.rotation, child.local.scale);
            }
            child._world_invalidated = false;
            cur = child;
        }
    }
}

export declare namespace Transform {
    export { Local }
}