import EventEmitterImpl from "../../base/EventEmitterImpl.js";
import TRS from "../math/TRS.js";
import mat3 from "../math/mat3.js";
import mat4, { Mat4 } from "../math/mat4.js";
import quat, { Quat } from "../math/quat.js";
import vec3, { Vec3 } from "../math/vec3.js";
import FrameChangeRecord from "./FrameChangeRecord.js";

export enum TransformBit {
    NONE = 0,
    POSITION = (1 << 0),
    ROTATION = (1 << 1),
    SCALE = (1 << 2),
    RS = TransformBit.ROTATION | TransformBit.SCALE,
    TRS = TransformBit.POSITION | TransformBit.ROTATION | TransformBit.SCALE,
}

interface EventMap {
    TRANSFORM_CHANGED: (flag: TransformBit) => void;
}

const mat3_a = mat3.create();
const quat_a = quat.create();

export default class Transform extends FrameChangeRecord implements TRS {
    private _explicit_visibilityFlag?: number;
    private _implicit_visibilityFlag?: number;
    public get visibilityFlag(): number {
        if (this._explicit_visibilityFlag != undefined) {
            return this._explicit_visibilityFlag;
        }
        if (this._implicit_visibilityFlag != undefined) {
            return this._implicit_visibilityFlag;
        }
        if (this._parent) {
            return this._implicit_visibilityFlag = this._parent.visibilityFlag;
        }
        return 0;
    }
    public set visibilityFlag(value) {
        const stack = [...this.children];
        while (stack.length) {
            const child = stack.pop()!;
            if (child._explicit_visibilityFlag != undefined) {
                continue;
            }
            child._implicit_visibilityFlag = value;
            stack.push(...child.children);
        }
        this._explicit_visibilityFlag = value;
    }

    private _changed = TransformBit.TRS;

    private _eventEmitter: EventEmitterImpl<EventMap> | undefined;
    get eventEmitter(): EventEmitterImpl<EventMap> {
        if (!this._eventEmitter) {
            this._eventEmitter = new EventEmitterImpl;
        }
        return this._eventEmitter;
    }

    private _scale: Readonly<Vec3> = [1, 1, 1];
    get scale(): Readonly<Vec3> {
        return this._scale
    }
    set scale(value: Readonly<Vec3>) {
        Object.assign(this._scale, value);
        this.dirty(TransformBit.SCALE);
    }

    private _rotation: Quat = quat.create()
    /**
     * rotation is normalized.
     */
    get rotation(): Readonly<Quat> {
        return this._rotation;
    }
    set rotation(value: Readonly<Quat>) {
        Object.assign(this._rotation, value);
        this.dirty(TransformBit.ROTATION);
    }

    get euler(): Readonly<Vec3> {
        return quat.toEuler(vec3.create(), this._rotation);
    }
    set euler(value: Readonly<Vec3>) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(TransformBit.ROTATION);
    }

    private _position: Vec3 = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3>) {
        Object.assign(this._position, value);
        this.dirty(TransformBit.POSITION);
    }

    private _world_rotation: Quat = quat.create()
    get world_rotation(): Readonly<Quat> {
        this.updateTransform();
        return this._world_rotation;
    }
    set world_rotation(value: Readonly<Quat>) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }

        quat.conjugate(quat_a, this._parent.world_rotation);
        quat.multiply(quat_a, quat_a, value);
        this.rotation = quat_a;
    }

    private _world_position: Vec3 = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.updateTransform();
        return this._world_position;
    }
    set world_position(val: Readonly<Vec3>) {
        this.position = this._parent ? vec3.transformMat4(vec3.create(), val, mat4.invert(mat4.create(), this._parent.world_matrix)) : val;
    }

    private _world_scale: Vec3 = vec3.create(1, 1, 1);
    public get world_scale(): Vec3 {
        return this._world_scale;
    }

    private _children: this[] = [];

    get children(): readonly this[] {
        return this._children;
    }

    private _parent: Transform | undefined;
    get parent(): Transform | undefined {
        return this._parent;
    }

    private _matrix = mat4.create();
    public get matrix() {
        this.updateTransform();
        return this._matrix;
    }

    private _world_matrix: Mat4 = mat4.create();
    get world_matrix(): Readonly<Mat4> {
        this.updateTransform();
        return this._world_matrix;
    }

    constructor(public readonly name: string = '') {
        super(0xffffffff);
    }

    addChild(child: this): void {
        child._implicit_visibilityFlag = undefined;
        child._parent = this;

        this._children.push(child);
    }

    getChildByPath(paths: readonly string[]): Transform | undefined {
        let current: Transform | undefined = this;
        for (let i = 0; i < paths.length; i++) {
            if (!current) {
                break;
            }
            current = current.children.find(child => child.name == paths[i]);
        }

        return current;
    }

    private dirty(flag: TransformBit): void {
        this._changed |= flag;
        this.hasChanged |= flag;
        this._eventEmitter?.emit("TRANSFORM_CHANGED", this._changed);
        for (const child of this._children) {
            child.dirty(flag);
        }
    }

    private updateTransform(): void {
        if (this._changed == TransformBit.NONE) return;

        if (!this._parent) {
            mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
            Object.assign(this._world_matrix, this._matrix);
            Object.assign(this._world_rotation, this._rotation);
            Object.assign(this._world_position, this._position);
            Object.assign(this._world_scale, this._scale);
            this._changed = TransformBit.NONE;
            return;
        }

        mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
        mat4.multiply(this._world_matrix, this._parent.world_matrix, this._matrix);
        quat.multiply(this._world_rotation, this._parent.world_rotation, this._rotation);
        vec3.transformMat4(this._world_position, vec3.ZERO, this._world_matrix);

        quat.conjugate(quat_a, this._world_rotation);
        mat3.fromQuat(mat3_a, quat_a);
        mat3.multiplyMat4(mat3_a, mat3_a, this._world_matrix);
        vec3.set(this._world_scale, mat3_a[0], mat3_a[4], mat3_a[8]);

        this._changed = TransformBit.NONE;
    }
}