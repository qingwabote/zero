import Component from "./Component.js";
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

export default class Node {
    private _name: string;
    get name(): string {
        return this._name;
    }

    private _dirtyFlag = TransformBit.TRS;

    private _scale: Readonly<Vec3> = [1, 1, 1];
    get scale(): Readonly<Vec3> {
        return this._scale
    }
    set scale(value: Readonly<Vec3>) {
        this._scale = value;
        this.dirty(TransformBit.SCALE);
    }

    private _rotation: Quat = quat.create()
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

    private _position: Readonly<Vec3> = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3>) {
        this._position = value;
        this.dirty(TransformBit.POSITION);
    }

    private _components: Component[] = [];

    private _children: Map<Node, Node> = new Map;

    private _parent: Node | undefined;
    get parent(): Node | undefined {
        return this._parent;
    }

    private _matrix: Mat4 = mat4.create();
    get matrix(): Readonly<Mat4> {
        this.clean();
        return this._matrix;
    }

    constructor(name: string = '') {
        this._name = name;
    }

    addComponent<T extends Component>(constructor: ComponentConstructor<T>): T {
        const component = new constructor(this);
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
        this._dirtyFlag |= flag;
        for (const [child] of this._children) {
            child.dirty(flag);
        }
    }

    private clean(): void {
        if (this._dirtyFlag == TransformBit.NONE) return;

        if (!this._parent) {
            // if (this._dirtyFlag & TransformBit.POSITION) {
            //     mat4.translate2(this._matrix, this._matrix, this._position);
            // }
            mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
            this._dirtyFlag = TransformBit.NONE;
            return;
        }

        this._parent.clean();
        // if (this._dirtyFlag & TransformBit.POSITION) {
        // const worldPos = vec3.transformMat4(vec3.create(), this._position, this._parent.matrix)
        // mat4.translate2(this._matrix, this._matrix, worldPos);
        mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
        mat4.multiply(this._matrix, this._parent.matrix, this._matrix);
        this._dirtyFlag = TransformBit.NONE;
        // }
    }
}