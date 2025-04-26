import { TRS } from "../../math/TRS.js";
import { Mat4Like, mat4 } from "../../math/mat4.js";
import { QuatLike, quat } from "../../math/quat.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { Periodic } from "./Periodic.js";
import { BlockAllocator } from "./internal/BlockAllocator.js";

const vec3_a = vec3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();

const dirtyTransforms: Transform[] = [];

const trs = {
    position: 3,
    rotation: 4,
    scale: 3,
    invalidated: 1,
    matrix: 16,
}

const local_allocator = new BlockAllocator(trs);
const world_allocator = new BlockAllocator(trs);

const transforms: Transform[] = [];

export class Transform implements TRS {

    private _local_block: ReturnType<typeof local_allocator.alloc>;
    get position(): Readonly<Vec3Like> {
        return this._local_block.position as any
    }
    set position(value: Readonly<Vec3Like>) {
        vec3.copy(this._local_block.position as any, value)
        this.invalidate();
    }

    /**
     * rotation is normalized.
     */
    get rotation(): Readonly<QuatLike> {
        return this._local_block.rotation as any;
    }
    set rotation(value: Readonly<QuatLike>) {
        vec4.copy(this._local_block.rotation as any, value)
        this.invalidate();
    }

    get scale(): Readonly<Vec3Like> {
        return this._local_block.scale as any;
    }
    set scale(value: Readonly<Vec3Like>) {
        vec3.copy(this._local_block.scale as any, value)
        this.invalidate();
    }

    private _euler = vec3.create();
    get euler(): Readonly<Vec3Like> {
        return quat.toEuler(this._euler, this.rotation);
    }
    set euler(value: Readonly<Vec3Like>) {
        quat.fromEuler(this.rotation, value[0], value[1], value[2]);
        this.invalidate();
    }

    public get matrix(): Readonly<Mat4Like> {
        if (this._local_block.invalidated[0] == 1) {
            mat4.fromTRS(this._local_block.matrix as any, this.position, this.rotation, this.scale);
            this._local_block.invalidated[0] = 0;
        }
        return this._local_block.matrix as any;
    }
    public set matrix(value: Readonly<Mat4Like>) {
        mat4.toTRS(value, this.position, this.rotation, this.scale);
        this.invalidate();
    }

    private _world_block: ReturnType<typeof world_allocator.alloc>;

    get world_position(): Readonly<Vec3Like> {
        this.world_update();
        return this._world_block.position as any;
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

    get world_rotation(): Readonly<QuatLike> {
        this.world_update();
        return this._world_block.rotation as any;
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

    public get world_scale(): Readonly<Vec3Like> {
        this.world_update();
        return this._world_block.scale as any;
    }

    get world_matrix(): Readonly<Mat4Like> {
        this.world_update();
        return this._world_block.matrix as any;
    }

    private _children: this[] = [];
    get children(): readonly this[] {
        return this._children;
    }

    private _parent?: this = undefined;
    get parent(): this | undefined {
        return this._parent;
    }

    private _hasChangedFlag = new Periodic(1, 0);
    get hasChangedFlag(): Readonly<Periodic> {
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
        const local_block = local_allocator.alloc();
        local_block.position.set(vec3.ZERO);
        local_block.rotation.set(quat.IDENTITY);
        local_block.scale.set(vec3.ONE);
        local_block.matrix.set(mat4.IDENTITY);
        local_block.invalidated[0] = 0;
        this._local_block = local_block;


        const world_block = world_allocator.alloc();
        world_block.position.set(vec3.ZERO);
        world_block.rotation.set(quat.IDENTITY);
        world_block.scale.set(vec3.ONE);
        world_block.matrix.set(mat4.IDENTITY);
        world_block.invalidated[0] = 0;
        this._world_block = world_block;

        transforms.push(this);
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
            if (cur._world_block.invalidated[0] == 1) {
                continue;
            }
            cur._world_block.invalidated[0] = 1;
            cur._hasChangedFlag.value = 1;
            for (const child of cur._children) {
                dirtyTransforms[i++] = child;
            }
        }

        this._local_block.invalidated[0] = 1;
    }

    private world_update(): void {
        let i = 0;
        let cur: Transform | undefined = this;
        while (cur) {
            if (cur._world_block.invalidated[0] == 0) {
                break;
            }

            dirtyTransforms[i++] = cur;
            cur = cur.parent;
        }

        while (i) {
            const child = dirtyTransforms[--i];
            if (cur) {
                mat4.multiply(child._world_block.matrix as any, cur._world_block.matrix as any, child.matrix);
                mat4.toTRS(child._world_block.matrix as any, child._world_block.position as any, child._world_block.rotation as any, child._world_block.scale as any);
            } else {
                child._world_block.position.set(child._local_block.position)
                child._world_block.rotation.set(child._local_block.rotation)
                child._world_block.scale.set(child._local_block.scale)
                child._world_block.matrix.set(child.matrix)
            }
            child._world_block.invalidated[0] = 0;
            cur = child;
        }
    }
}