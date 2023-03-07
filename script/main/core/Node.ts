import EventEmitterImpl from "../base/EventEmitterImpl.js";
import Component from "./Component.js";
import mat3 from "./math/mat3.js";
import mat4, { Mat4 } from "./math/mat4.js";
import quat, { Quat } from "./math/quat.js";
import vec3, { Vec3 } from "./math/vec3.js";

export enum TransformBit {
    NONE = 0,
    POSITION = (1 << 0),
    ROTATION = (1 << 1),
    SCALE = (1 << 2),
    RS = TransformBit.ROTATION | TransformBit.SCALE,
    TRS = TransformBit.POSITION | TransformBit.ROTATION | TransformBit.SCALE,
}

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;
type AbstractConstructor<T> = abstract new (...args: ConstructorParameters<typeof Component>) => T;

interface EventMap {
    TRANSFORM_CHANGED: (flag: TransformBit) => void;
}

const mat3_a = mat3.create();
const quat_a = quat.create();

export default class Node {
    static frameId = 0;

    private _name: string;
    get name(): string {
        return this._name;
    }

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

    private _frameId = 0;

    private _changed = TransformBit.TRS;
    private _hasChanged = TransformBit.TRS;
    get hasChanged(): TransformBit {
        return this._frameId == Node.frameId ? this._hasChanged : 0;
    }
    set hasChanged(flags: TransformBit) {
        this._frameId = Node.frameId;
        this._hasChanged = flags;
    }

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
        this._scale = value;
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
        quat.multiply(quat_a, quat_a, this.world_rotation);
        this.rotation = quat_a;
    }

    private _world_position: Vec3 = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.updateTransform();
        return this._world_position;
    }
    set world_position(val: Readonly<Vec3>) {
        this.position = this._parent ? vec3.transformMat4(vec3.create(), val, mat4.invert(mat4.create(), this._parent.matrix)) : val;
    }

    private _world_scale: Vec3 = vec3.create(1, 1, 1);
    public get world_scale(): Vec3 {
        return this._world_scale;
    }

    private _components: Component[] = [];

    private _children: Node[] = [];

    get children(): readonly Node[] {
        return this._children;
    }

    private _parent: Node | undefined;
    get parent(): Node | undefined {
        return this._parent;
    }

    private _matrix: Mat4 = mat4.create();
    get matrix(): Readonly<Mat4> {
        this.updateTransform();
        return this._matrix;
    }

    constructor(name: string = '') {
        this._name = name;
    }

    addComponent<T extends Component>(constructor: ComponentConstructor<T>): T {
        const component = new constructor(this);
        zero.addComponent(component);
        this._components.push(component);
        return component;
    }

    getComponent<T extends Component>(constructor: AbstractConstructor<T>): T | null {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component
            }
        }
        return null
    }

    addChild(child: Node): void {
        child._implicit_visibilityFlag = undefined;
        child._parent = this;

        this._children.push(child);
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
            // if (this._dirtyFlag & TransformBit.POSITION) {
            //     mat4.translate2(this._matrix, this._matrix, this._position);
            // }
            mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
            Object.assign(this._world_rotation, this._rotation);
            Object.assign(this._world_position, this._position);
            Object.assign(this._world_scale, this._scale);
            this._changed = TransformBit.NONE;
            return;
        }

        // if (this._dirtyFlag & TransformBit.POSITION) {
        // const worldPos = vec3.transformMat4(vec3.create(), this._position, this._parent.matrix)
        // mat4.translate2(this._matrix, this._matrix, worldPos);
        mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
        mat4.multiply(this._matrix, this._parent.matrix, this._matrix);
        quat.multiply(this._world_rotation, this._parent.world_rotation, this._rotation);
        vec3.transformMat4(this._world_position, vec3.ZERO, this._matrix);

        quat.conjugate(quat_a, this._world_rotation);
        mat3.fromQuat(mat3_a, quat_a);
        mat3.multiplyMat4(mat3_a, mat3_a, this._matrix);
        vec3.set(this._world_scale, mat3_a[0], mat3_a[4], mat3_a[8]);

        this._changed = TransformBit.NONE;
        // }
    }
}