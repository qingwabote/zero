import Component from "./base/Component.js";
import EventEmitter from "./base/EventEmitter.js";
import mat4, { Mat4 } from "./math/mat4.js";
import quat, { Quat } from "./math/quat.js";
import vec3, { Vec3 } from "./math/vec3.js";
import VisibilityBit from "./render/VisibilityBit.js";

export enum TransformBit {
    NONE = 0,
    POSITION = (1 << 0),
    ROTATION = (1 << 1),
    SCALE = (1 << 2),
    RS = TransformBit.ROTATION | TransformBit.SCALE,
    TRS = TransformBit.POSITION | TransformBit.ROTATION | TransformBit.SCALE,
}

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;

interface EventMap {
    TRANSFORM_CHANGED: (flag: TransformBit) => void;
}

export default class Node {
    static frameId = 0;

    private _name: string;
    get name(): string {
        return this._name;
    }

    visibility: VisibilityBit = VisibilityBit.DEFAULT;

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

    private _eventEmitter: EventEmitter<EventMap> | undefined;
    get eventEmitter(): EventEmitter<EventMap> {
        if (!this._eventEmitter) {
            this._eventEmitter = new EventEmitter;
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

    private _world_position: Vec3 = vec3.create();
    get world_position(): Readonly<Vec3> {
        this.updateTransform();
        return this._world_position;
    }
    set world_position(val: Readonly<Vec3>) {
        this.position = this._parent ? vec3.transformMat4(vec3.create(), val, mat4.invert(mat4.create(), this._parent.matrix)) : val;
    }

    private _components: Component[] = [];

    private _children: Map<Node, Node> = new Map;

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
        zero.componentScheduler.add(component);
        this._components.push(component);
        return component;
    }

    getComponent<T extends Component>(constructor: ComponentConstructor<T>): T | null {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component
            }
        }
        return null
    }

    addChild(child: Node): void {
        this._children.set(child, child);
        child._parent = this;
    }

    private dirty(flag: TransformBit): void {
        this._changed |= flag;
        this.hasChanged |= flag;
        this._eventEmitter?.emit("TRANSFORM_CHANGED", this._changed);
        for (const child of this._children.keys()) {
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
        this._changed = TransformBit.NONE;
        // }
    }
}