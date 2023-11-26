import { EventEmitter } from "../../../base/EventEmitter.js";
import { EventEmitterImpl } from "../../../base/EventEmitterImpl.js";
import { TRS } from "../../math/TRS.js";
import { mat3 } from "../../math/mat3.js";
import { Mat4Like, mat4 } from "../../math/mat4.js";
import { Quat, QuatLike, quat } from "../../math/quat.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";

export enum TransformBits {
    NONE = 0,
    POSITION = (1 << 0),
    ROTATION = (1 << 1),
    SCALE = (1 << 2),
    RS = TransformBits.ROTATION | TransformBits.SCALE,
    TRS = TransformBits.POSITION | TransformBits.ROTATION | TransformBits.SCALE,
}

export enum TransformEvent {
    TRANSFORM_CHANGED = "TRANSFORM_CHANGED",
}

interface TransformEventToListener {
    [TransformEvent.TRANSFORM_CHANGED]: (flag: TransformBits) => void;
}

const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();

export class Transform extends FrameChangeRecord implements TRS, EventEmitter<TransformEventToListener> {
    private _explicit_visibilityFlag?: number = undefined;
    private _implicit_visibilityFlag?: number = undefined;
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

    private _changed = TransformBits.TRS;

    private _eventEmitter?: EventEmitterImpl<TransformEventToListener> = undefined;
    get eventEmitter(): EventEmitterImpl<TransformEventToListener> {
        if (!this._eventEmitter) {
            this._eventEmitter = new EventEmitterImpl;
        }
        return this._eventEmitter;
    }

    private _position = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3Like>) {
        vec3.copy(this._position, value)
        this.dirty(TransformBits.POSITION);
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
        this.dirty(TransformBits.ROTATION);
    }

    private _scale = vec3.create(1, 1, 1);
    get scale(): Readonly<Vec3> {
        return this._scale
    }
    set scale(value: Readonly<Vec3Like>) {
        vec3.copy(this._scale, value)
        this.dirty(TransformBits.SCALE);
    }

    private _euler = vec3.create();
    get euler(): Readonly<Vec3> {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value: Readonly<Vec3Like>) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(TransformBits.ROTATION);
    }

    private _world_position = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.updateTransform();
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
        this.updateTransform();
        return this._world_rotation;
    }
    set world_rotation(value: Readonly<QuatLike>) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }

        quat.conjugate(quat_a, this._parent.world_rotation);
        quat.multiply(quat_a, quat_a, value);
        this.rotation = quat_a;
    }

    private _world_scale = vec3.create(1, 1, 1);
    public get world_scale(): Vec3 {
        return this._world_scale;
    }

    private _children: this[] = [];

    get children(): readonly this[] {
        return this._children;
    }

    private _parent?: Transform = undefined;
    get parent(): Transform | undefined {
        return this._parent;
    }

    private _matrix = mat4.create();
    public get matrix() {
        this.updateTransform();
        return this._matrix;
    }

    private _world_matrix = mat4.create();
    get world_matrix(): Readonly<Mat4Like> {
        this.updateTransform();
        return this._world_matrix;
    }

    private __emitter?: EventEmitter<TransformEventToListener> = undefined;
    private get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }

    constructor(public readonly name: string = '') {
        super(0xffffffff);
    }

    has<K extends TransformEvent>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends TransformEvent>(name: K, listener: TransformEventToListener[K] extends (event: any) => void ? TransformEventToListener[K] : (event: any) => void): void {
        this._emitter.on(name, listener);
    }
    off<K extends TransformEvent>(name: K, listener: TransformEventToListener[K] extends (event: any) => void ? TransformEventToListener[K] : (event: any) => void): void {
        this._emitter.off(name, listener);
    }
    emit<K extends TransformEvent>(name: K, event?: Parameters<TransformEventToListener[K] extends (event: any) => void ? TransformEventToListener[K] : (event: any) => void>[0] | undefined): void {
        this.__emitter?.emit(name, event);
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

    private dirty(flag: TransformBits): void {
        this._changed |= flag;
        this.hasChanged |= flag;
        this.emit(TransformEvent.TRANSFORM_CHANGED, this._changed);
        for (const child of this._children) {
            child.dirty(flag);
        }
    }

    private updateTransform(): void {
        if (this._changed == TransformBits.NONE) return;

        if (!this._parent) {
            mat4.fromTRS(this._matrix, this._rotation, this._position, this._scale);
            this._world_matrix.splice(0, this._matrix.length, ...this._matrix);

            this._world_position.splice(0, this._position.length, ...this._position);
            this._world_rotation.splice(0, this._rotation.length, ...this._rotation);
            this._world_scale.splice(0, this._scale.length, ...this._scale);

            this._changed = TransformBits.NONE;
            return;
        }

        mat4.fromTRS(this._matrix, this._rotation, this._position, this._scale);
        mat4.multiply(this._world_matrix, this._parent.world_matrix, this._matrix);

        vec3.transformMat4(this._world_position, vec3.ZERO, this._world_matrix);

        quat.multiply(this._world_rotation, this._parent.world_rotation, this._rotation);

        quat.conjugate(quat_a, this._world_rotation);
        mat3.fromQuat(mat3_a, quat_a);
        mat3.multiplyMat4(mat3_a, mat3_a, this._world_matrix);
        vec3.set(this._world_scale, mat3_a[0], mat3_a[4], mat3_a[8]);

        this._changed = TransformBits.NONE;
    }
}