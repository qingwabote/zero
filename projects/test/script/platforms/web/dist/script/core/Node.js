import mat4 from "./math/mat4.js";
import quat from "./math/quat.js";
import vec3 from "./math/vec3.js";
import VisibilityBit from "./render/VisibilityBit.js";
import EventEmitter from "./utils/EventEmitter.js";
export var TransformBit;
(function (TransformBit) {
    TransformBit[TransformBit["NONE"] = 0] = "NONE";
    TransformBit[TransformBit["POSITION"] = 1] = "POSITION";
    TransformBit[TransformBit["ROTATION"] = 2] = "ROTATION";
    TransformBit[TransformBit["SCALE"] = 4] = "SCALE";
    TransformBit[TransformBit["RS"] = 6] = "RS";
    TransformBit[TransformBit["TRS"] = 7] = "TRS";
})(TransformBit || (TransformBit = {}));
export default class Node {
    _name;
    get name() {
        return this._name;
    }
    visibility = VisibilityBit.DEFAULT;
    _dirtyFlag = TransformBit.TRS;
    _eventEmitter;
    get eventEmitter() {
        if (!this._eventEmitter) {
            this._eventEmitter = new EventEmitter;
        }
        return this._eventEmitter;
    }
    _scale = [1, 1, 1];
    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale = value;
        this.dirty(TransformBit.SCALE);
    }
    _rotation = quat.create();
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        Object.assign(this._rotation, value);
        this.dirty(TransformBit.ROTATION);
    }
    _rotationWorld = quat.create();
    get rotationWorld() {
        this.updateTransform();
        return this._rotationWorld;
    }
    get euler() {
        return quat.toEuler(vec3.create(), this._rotation);
    }
    set euler(value) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(TransformBit.ROTATION);
    }
    _position = vec3.create();
    get position() {
        return this._position;
    }
    set position(value) {
        Object.assign(this._position, value);
        this.dirty(TransformBit.POSITION);
    }
    _positionWorld = vec3.create();
    get positionWorld() {
        this.updateTransform();
        return this._positionWorld;
    }
    _components = [];
    _children = new Map;
    _parent;
    get parent() {
        return this._parent;
    }
    _matrix = mat4.create();
    get matrix() {
        return this._matrix;
    }
    constructor(name = '') {
        this._name = name;
    }
    addComponent(constructor) {
        const component = new constructor(this);
        zero.componentScheduler.add(component);
        this._components.push(component);
        return component;
    }
    getComponent(constructor) {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component;
            }
        }
        return null;
    }
    addChild(child) {
        this._children.set(child, child);
        child._parent = this;
    }
    dirty(flag) {
        this._dirtyFlag |= flag;
        zero.renderScene.dirtyObjects.set(this, this);
        this._eventEmitter?.emit("TRANSFORM_CHANGED", this._dirtyFlag);
        for (const child of this._children.keys()) {
            child.dirty(flag);
        }
    }
    updateTransform() {
        if (this._dirtyFlag == TransformBit.NONE)
            return;
        if (!this._parent) {
            // if (this._dirtyFlag & TransformBit.POSITION) {
            //     mat4.translate2(this._matrix, this._matrix, this._position);
            // }
            mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
            Object.assign(this._rotationWorld, this._rotation);
            Object.assign(this._positionWorld, this._position);
            this._dirtyFlag = TransformBit.NONE;
            return;
        }
        this._parent.updateTransform();
        // if (this._dirtyFlag & TransformBit.POSITION) {
        // const worldPos = vec3.transformMat4(vec3.create(), this._position, this._parent.matrix)
        // mat4.translate2(this._matrix, this._matrix, worldPos);
        mat4.fromRTS(this._matrix, this._rotation, this._position, this._scale);
        mat4.multiply(this._matrix, this._parent.matrix, this._matrix);
        quat.multiply(this._rotationWorld, this._parent.rotationWorld, this._rotation);
        vec3.transformMat4(this._positionWorld, vec3.ZERO, this._matrix);
        this._dirtyFlag = TransformBit.NONE;
        // }
    }
}
//# sourceMappingURL=Node.js.map