import { TRS } from "../../math/TRS.js";
import { mat3 } from "../../math/mat3.js";
import { Mat4, Mat4Like, mat4 } from "../../math/mat4.js";
import { Quat, QuatLike, quat } from "../../math/quat.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { PeriodicFlag } from "./PeriodicFlag.js";

const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();

const dirtyTransforms: Transform[] = [];

export class Transform implements TRS {
    private _explicit_visibility?: number = undefined;
    private _implicit_visibility: number | undefined = undefined;
    public get visibility(): number {
        return this._explicit_visibility ?? this._implicit_visibility ?? (this._implicit_visibility = this._parent?.visibility) ?? 0;
    }
    public set visibility(value) {
        const stack = [...this.children];
        let child;
        while (child = stack.pop()) {
            if (child._explicit_visibility != undefined) {
                continue;
            }
            child._implicit_visibility = value;
            stack.push(...child.children);
        }
        this._explicit_visibility = value;
    }

    private _local_invalidated = false;

    private _position = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3Like>) {
        vec3.copy(this._position, value)
        this.invalidate();
    }

    private _rotation = quat.create()
    /**
     * rotation is normalized.
     */
    get rotation(): Readonly<Quat> {
        return this._rotation;
    }
    set rotation(value: Readonly<QuatLike>) {
        vec4.copy(this._rotation, value)
        this.invalidate();
    }

    private _scale = vec3.create(1, 1, 1);
    get scale(): Readonly<Vec3> {
        return this._scale
    }
    set scale(value: Readonly<Vec3Like>) {
        vec3.copy(this._scale, value)
        this.invalidate();
    }

    private _euler = vec3.create();
    get euler(): Readonly<Vec3> {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value: Readonly<Vec3Like>) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.invalidate();
    }

    private _matrix = mat4.create();
    public get matrix(): Readonly<Mat4> {
        this.local_update();
        return this._matrix;
    }
    public set matrix(value: Readonly<Mat4Like>) {
        mat4.toTRS(value, this._position, this._rotation, this._scale);
        this.invalidate();
    }

    private _world_invalidated = false;

    private _world_position = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.world_update();
        return this._world_position;
    }
    set world_position(value: Readonly<Vec3Like>) {
        if (!this._parent) {
            this.position = value;
            return;
        }

        mat4.invert(mat4_a, this._parent.world_matrix);
        vec3.transformMat4(vec3_a, value, mat4_a);
        this.position = vec3_a;
    }

    private _world_rotation = quat.create()
    get world_rotation(): Readonly<Quat> {
        this.world_update();
        return this._world_rotation;
    }
    set world_rotation(value: Readonly<QuatLike>) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }

        quat.conjugate(this._rotation, this._parent.world_rotation);
        quat.multiply(this._rotation, this._rotation, value);
        this.invalidate();
    }

    private _world_scale = vec3.create(1, 1, 1);
    public get world_scale(): Readonly<Vec3> {
        return this._world_scale;
    }

    private _world_matrix = mat4.create();
    get world_matrix(): Readonly<Mat4> {
        this.world_update();
        return this._world_matrix;
    }

    private _children: this[] = [];
    get children(): readonly this[] {
        return this._children;
    }

    private _parent?: this = undefined;
    get parent(): this | undefined {
        return this._parent;
    }

    private _hasChangedFlag: PeriodicFlag = new PeriodicFlag(1);
    get hasChangedFlag(): PeriodicFlag.Readonly {
        return this._hasChangedFlag;
    }

    constructor(public readonly name: string = '') { }

    addChild(child: this): void {
        child._implicit_visibility = undefined;
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
            cur._world_invalidated = true;
            cur._hasChangedFlag.value = 1;
            for (const child of cur._children) {
                dirtyTransforms[i++] = child;
            }
        }

        this._local_invalidated = true;
    }

    private local_update(): void {
        if (!this._local_invalidated) return;

        mat4.fromTRS(this._matrix, this._position, this._rotation, this._scale);

        this._local_invalidated = false;
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
                mat4.multiply(child._world_matrix, cur._world_matrix, child.matrix);

                vec3.transformMat4(child._world_position, vec3.ZERO, child._world_matrix);

                quat.multiply(child._world_rotation, cur._world_rotation, child._rotation);

                quat.conjugate(quat_a, child._world_rotation);
                mat3.fromQuat(mat3_a, quat_a);
                mat3.multiplyMat4(mat3_a, mat3_a, child._world_matrix);
                vec3.set(child._world_scale, mat3_a[0], mat3_a[4], mat3_a[8]);
            } else {
                child._world_matrix.splice(0, child.matrix.length, ...child.matrix);

                child._world_position.splice(0, child._position.length, ...child._position);
                child._world_rotation.splice(0, child._rotation.length, ...child._rotation);
                child._world_scale.splice(0, child._scale.length, ...child._scale);
            }
            child._world_invalidated = false;
            cur = child;
        }
    }
}