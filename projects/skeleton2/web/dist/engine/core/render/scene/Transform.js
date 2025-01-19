import { mat3 } from "../../math/mat3.js";
import { mat4 } from "../../math/mat4.js";
import { quat } from "../../math/quat.js";
import { vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { Periodic } from "./Periodic.js";
const vec3_a = vec3.create();
const mat3_a = mat3.create();
const mat4_a = mat4.create();
const quat_a = quat.create();
const dirtyTransforms = [];
export class Transform {
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
        this.invalidate();
    }
    /**
     * rotation is normalized.
     */
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        vec4.copy(this._rotation, value);
        this.invalidate();
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        vec3.copy(this._scale, value);
        this.invalidate();
    }
    get euler() {
        return quat.toEuler(this._euler, this._rotation);
    }
    set euler(value) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2]);
        this.invalidate();
    }
    get matrix() {
        this.local_update();
        return this._matrix;
    }
    set matrix(value) {
        mat4.toTRS(value, this._position, this._rotation, this._scale);
        this.invalidate();
    }
    get world_position() {
        this.world_update();
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
        this.world_update();
        return this._world_rotation;
    }
    set world_rotation(value) {
        if (!this._parent) {
            this.rotation = value;
            return;
        }
        quat.conjugate(this._rotation, this._parent.world_rotation);
        quat.multiply(this._rotation, this._rotation, value);
        this.invalidate();
    }
    get world_scale() {
        return this._world_scale;
    }
    get world_matrix() {
        this.world_update();
        return this._world_matrix;
    }
    get children() {
        return this._children;
    }
    get parent() {
        return this._parent;
    }
    get hasChangedFlag() {
        return this._hasChangedFlag;
    }
    constructor(name = '') {
        this.name = name;
        this._explicit_visibility = undefined;
        this._implicit_visibility = undefined;
        this._local_invalidated = false;
        this._position = vec3.create();
        this._rotation = quat.create();
        this._scale = vec3.create(1, 1, 1);
        this._euler = vec3.create();
        this._matrix = mat4.create();
        this._world_invalidated = false;
        this._world_position = vec3.create();
        this._world_rotation = quat.create();
        this._world_scale = vec3.create(1, 1, 1);
        this._world_matrix = mat4.create();
        this._children = [];
        this._parent = undefined;
        this._hasChangedFlag = new Periodic(1, 0);
    }
    addChild(child) {
        child._implicit_visibility = undefined;
        child._parent = this;
        child.invalidate();
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
    invalidate() {
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
    local_update() {
        if (!this._local_invalidated)
            return;
        mat4.fromTRS(this._matrix, this._position, this._rotation, this._scale);
        this._local_invalidated = false;
    }
    world_update() {
        let i = 0;
        let cur = this;
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
            }
            else {
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
