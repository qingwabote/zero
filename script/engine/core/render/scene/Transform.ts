import { TRS } from "../../math/TRS.js";
import { mat3 } from "../../math/mat3.js";
import { Mat4, Mat4Like, mat4 } from "../../math/mat4.js";
import { Quat, QuatLike, quat } from "../../math/quat.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { PeriodicFlag } from "./PeriodicFlag.js";

enum ChangeBit {
    NONE = 0,
    POSITION = (1 << 0),
    ROTATION = (1 << 1),
    SCALE = (1 << 2),
    TRS = ChangeBit.POSITION | ChangeBit.ROTATION | ChangeBit.SCALE,
}

const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();

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

    private _changed = ChangeBit.TRS;

    private _position = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3Like>) {
        vec3.copy(this._position, value)
        this.dirty(ChangeBit.POSITION);
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
        this.dirty(ChangeBit.ROTATION);
    }

    private _scale = vec3.create(1, 1, 1);
    get scale(): Readonly<Vec3> {
        return this._scale
    }
    set scale(value: Readonly<Vec3Like>) {
        vec3.copy(this._scale, value)
        this.dirty(ChangeBit.SCALE);
    }

    private _euler = vec3.create();
    get euler(): Readonly<Vec3> {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value: Readonly<Vec3Like>) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(ChangeBit.ROTATION);
    }

    private _world_position = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.update();
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
        this.update();
        return this._world_rotation;
    }
    set world_rotation(value: Readonly<QuatLike>) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }

        quat.conjugate(this._rotation, this._parent.world_rotation);
        quat.multiply(this._rotation, this._rotation, value);
        this.dirty(ChangeBit.ROTATION);
    }

    private _world_scale = vec3.create(1, 1, 1);
    public get world_scale(): Readonly<Vec3> {
        return this._world_scale;
    }

    private _children: this[] = [];
    get children(): readonly this[] {
        return this._children;
    }

    private _parent?: this = undefined;
    get parent(): this | undefined {
        return this._parent;
    }

    private _matrix = mat4.create();
    public get matrix(): Mat4 {
        this.update();
        return this._matrix;
    }
    public set matrix(value: Readonly<Mat4Like>) {
        mat4.toTRS(value, this._position, this._rotation, this._scale);
        this.dirty(ChangeBit.TRS);
    }

    private _world_matrix = mat4.create();
    get world_matrix(): Readonly<Mat4> {
        this.update();
        return this._world_matrix;
    }

    private _hasChanged: PeriodicFlag<ChangeBit> = new PeriodicFlag(0xffffffff);
    get hasChanged(): PeriodicFlag.Readonly<ChangeBit> {
        return this._hasChanged;
    }

    constructor(public readonly name: string = '') { }

    addChild(child: this): void {
        child._implicit_visibility = undefined;
        child._parent = this;
        child.dirty(ChangeBit.TRS);

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

    private dirty(flag: ChangeBit): void {
        this._changed |= flag;
        this._hasChanged.addBit(flag);
        for (const child of this._children) {
            child.dirty(flag);
        }
    }

    private update(): void {
        if (this._changed == ChangeBit.NONE) return;

        if (!this._parent) {
            mat4.fromTRS(this._matrix, this._position, this._rotation, this._scale);
            this._world_matrix.splice(0, this._matrix.length, ...this._matrix);

            this._world_position.splice(0, this._position.length, ...this._position);
            this._world_rotation.splice(0, this._rotation.length, ...this._rotation);
            this._world_scale.splice(0, this._scale.length, ...this._scale);

            this._changed = ChangeBit.NONE;
            return;
        }

        mat4.fromTRS(this._matrix, this._position, this._rotation, this._scale);
        mat4.multiply(this._world_matrix, this._parent.world_matrix, this._matrix);

        vec3.transformMat4(this._world_position, vec3.ZERO, this._world_matrix);

        quat.multiply(this._world_rotation, this._parent.world_rotation, this._rotation);

        quat.conjugate(quat_a, this._world_rotation);
        mat3.fromQuat(mat3_a, quat_a);
        mat3.multiplyMat4(mat3_a, mat3_a, this._world_matrix);
        vec3.set(this._world_scale, mat3_a[0], mat3_a[4], mat3_a[8]);

        this._changed = ChangeBit.NONE;
    }
}
Transform.ChangeBit = ChangeBit;

export declare namespace Transform {
    export { ChangeBit }
}