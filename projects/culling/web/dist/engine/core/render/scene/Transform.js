import { mat3 } from "../../math/mat3.js";
import { mat4 } from "../../math/mat4.js";
import { quat } from "../../math/quat.js";
import { vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { ChangeRecord } from "./ChangeRecord.js";
var ChangeBits;
(function (ChangeBits) {
    ChangeBits[ChangeBits["NONE"] = 0] = "NONE";
    ChangeBits[ChangeBits["POSITION"] = 1] = "POSITION";
    ChangeBits[ChangeBits["ROTATION"] = 2] = "ROTATION";
    ChangeBits[ChangeBits["SCALE"] = 4] = "SCALE";
    ChangeBits[ChangeBits["TRS"] = 7] = "TRS";
})(ChangeBits || (ChangeBits = {}));
const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();
export class Transform extends ChangeRecord {
    get visibility() {
        var _a, _b, _c, _d;
        return (_d = (_b = (_a = this._explicit_visibility) !== null && _a !== void 0 ? _a : this._implicit_visibility) !== null && _b !== void 0 ? _b : (this._implicit_visibility = (_c = this._parent) === null || _c === void 0 ? void 0 : _c.visibility)) !== null && _d !== void 0 ? _d : 0;
    }
    set visibility(value) {
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
    get position() {
        return this._position;
    }
    set position(value) {
        vec3.copy(this._position, value);
        this.dirty(ChangeBits.POSITION);
    }
    /**
     * rotation is normalized.
     */
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        vec4.copy(this._rotation, value);
        this.dirty(ChangeBits.ROTATION);
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        vec3.copy(this._scale, value);
        this.dirty(ChangeBits.SCALE);
    }
    get euler() {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.dirty(ChangeBits.ROTATION);
    }
    get world_position() {
        this.update();
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
        this.update();
        return this._world_rotation;
    }
    set world_rotation(value) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }
        quat.conjugate(this._rotation, this._parent.world_rotation);
        quat.multiply(this._rotation, this._rotation, value);
        this.dirty(ChangeBits.ROTATION);
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
        this.update();
        return this._matrix;
    }
    set matrix(value) {
        mat4.toTRS(value, this._position, this._rotation, this._scale);
        this.dirty(ChangeBits.TRS);
    }
    get world_matrix() {
        this.update();
        return this._world_matrix;
    }
    constructor(name = '') {
        super(0xffffffff);
        this.name = name;
        this._explicit_visibility = undefined;
        this._implicit_visibility = undefined;
        this._changed = ChangeBits.TRS;
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
    }
    addChild(child) {
        child._implicit_visibility = undefined;
        child._parent = this;
        child.dirty(ChangeBits.TRS);
        this._children.push(child);
    }
    getChildByPath(paths) {
        let current = this;
        for (const path of paths) {
            if (!current) {
                break;
            }
            const children = current.children;
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
    lookAt(tar) {
        vec3.subtract(vec3_a, this.world_position, tar);
        vec3.normalize(vec3_a, vec3_a);
        quat.fromViewUp(quat_a, vec3_a);
        this.world_rotation = quat_a;
    }
    dirty(flag) {
        this._changed |= flag;
        this.hasChanged |= flag;
        for (const child of this._children) {
            child.dirty(flag);
        }
    }
    update() {
        if (this._changed == ChangeBits.NONE)
            return;
        if (!this._parent) {
            mat4.fromTRS(this._matrix, this._position, this._rotation, this._scale);
            this._world_matrix.splice(0, this._matrix.length, ...this._matrix);
            this._world_position.splice(0, this._position.length, ...this._position);
            this._world_rotation.splice(0, this._rotation.length, ...this._rotation);
            this._world_scale.splice(0, this._scale.length, ...this._scale);
            this._changed = ChangeBits.NONE;
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
        this._changed = ChangeBits.NONE;
    }
}
Transform.ChangeBits = ChangeBits;
