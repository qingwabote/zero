import { EventEmitterImpl } from "bastard";
import { mat3 } from "../../math/mat3.js";
import { mat4 } from "../../math/mat4.js";
import { quat } from "../../math/quat.js";
import { vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
export var TransformBits;
(function (TransformBits) {
    TransformBits[TransformBits["NONE"] = 0] = "NONE";
    TransformBits[TransformBits["POSITION"] = 1] = "POSITION";
    TransformBits[TransformBits["ROTATION"] = 2] = "ROTATION";
    TransformBits[TransformBits["SCALE"] = 4] = "SCALE";
    TransformBits[TransformBits["RS"] = 6] = "RS";
    TransformBits[TransformBits["TRS"] = 7] = "TRS";
})(TransformBits || (TransformBits = {}));
export var TransformEvent;
(function (TransformEvent) {
    TransformEvent["TRANSFORM_CHANGED"] = "TRANSFORM_CHANGED";
})(TransformEvent || (TransformEvent = {}));
const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();
export class Transform extends FrameChangeRecord {
    get visibility() {
        if (this._explicit_visibility != undefined) {
            return this._explicit_visibility;
        }
        if (this._implicit_visibility != undefined) {
            return this._implicit_visibility;
        }
        if (this._parent) {
            return this._implicit_visibility = this._parent.visibility;
        }
        return 0;
    }
    set visibility(value) {
        const stack = [...this.children];
        while (stack.length) {
            const child = stack.pop();
            if (child._explicit_visibility != undefined) {
                continue;
            }
            child._implicit_visibility = value;
            stack.push(...child.children);
        }
        this._explicit_visibility = value;
    }
    get eventEmitter() {
        if (!this._eventEmitter) {
            this._eventEmitter = new EventEmitterImpl;
        }
        return this._eventEmitter;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        vec3.copy(this._position, value);
        this.dirty(TransformBits.POSITION);
    }
    /**
     * rotation is normalized.
     */
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        vec4.copy(this._rotation, value);
        this.dirty(TransformBits.ROTATION);
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        vec3.copy(this._scale, value);
        this.dirty(TransformBits.SCALE);
    }
    get euler() {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(TransformBits.ROTATION);
    }
    get world_position() {
        this.updateTransform();
        return this._world_position;
    }
    set world_position(value) {
        if (!this._parent) {
            this.position = value;
            return;
        }
        mat4.invert(mat4_a, this._parent.world_matrix);
        vec3.transformMat4(vec3_a, value, mat4_a);
        this.position = vec3_a;
    }
    get world_rotation() {
        this.updateTransform();
        return this._world_rotation;
    }
    set world_rotation(value) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }
        quat.conjugate(quat_a, this._parent.world_rotation);
        quat.multiply(quat_a, quat_a, value);
        this.rotation = quat_a;
    }
    get world_scale() {
        return this._world_scale;
    }
    get children() {
        return this._children;
    }
    get parent() {
        return this._parent;
    }
    get matrix() {
        this.updateTransform();
        return this._matrix;
    }
    get world_matrix() {
        this.updateTransform();
        return this._world_matrix;
    }
    get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }
    constructor(name = '') {
        super(0xffffffff);
        this.name = name;
        this._explicit_visibility = undefined;
        this._implicit_visibility = undefined;
        this._changed = TransformBits.TRS;
        this._eventEmitter = undefined;
        this._position = vec3.create();
        this._rotation = quat.create();
        this._scale = vec3.create(1, 1, 1);
        this._euler = vec3.create();
        this._world_position = vec3.create();
        this._world_rotation = quat.create();
        this._world_scale = vec3.create(1, 1, 1);
        this._children = [];
        this._parent = undefined;
        this._matrix = mat4.create();
        this._world_matrix = mat4.create();
        this.__emitter = undefined;
    }
    has(name) {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on(name, listener) {
        this._emitter.on(name, listener);
    }
    off(name, listener) {
        this._emitter.off(name, listener);
    }
    emit(name, event) {
        var _a;
        (_a = this.__emitter) === null || _a === void 0 ? void 0 : _a.emit(name, event);
    }
    addChild(child) {
        child._implicit_visibility = undefined;
        child._parent = this;
        this._children.push(child);
    }
    getChildByPath(paths) {
        let current = this;
        for (let i = 0; i < paths.length; i++) {
            if (!current) {
                break;
            }
            current = current.children.find(child => child.name == paths[i]);
        }
        return current;
    }
    dirty(flag) {
        this._changed |= flag;
        this.hasChanged |= flag;
        this.emit(TransformEvent.TRANSFORM_CHANGED, this._changed);
        for (const child of this._children) {
            child.dirty(flag);
        }
    }
    updateTransform() {
        if (this._changed == TransformBits.NONE)
            return;
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
