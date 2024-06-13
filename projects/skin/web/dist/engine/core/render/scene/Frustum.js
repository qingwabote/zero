import { frustum } from "../../math/frustum.js";
import { vec3 } from "../../math/vec3.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
export class Frustum {
    constructor() {
        this._vertices_raw = frustum.vertices();
        this._vertices_tra = frustum.vertices();
        this._vertices = this._vertices_raw;
        this._faces_invalidated = true;
        this._faces = frustum.faces();
        this._hasChanged = new PeriodicFlag();
    }
    get vertices() {
        return this._vertices;
    }
    get faces() {
        if (!this._faces_invalidated) {
            return this._faces;
        }
        frustum.toFaces(this._faces, this._vertices);
        this._faces_invalidated = false;
        return this._faces;
    }
    get hasChanged() {
        return this._hasChanged.value;
    }
    orthographic(left, right, bottom, top, near, far) {
        frustum.orthographic(this._vertices_raw, left, right, bottom, top, near, far);
        this._vertices = this._vertices_raw;
        this._faces_invalidated = true;
        this._hasChanged.reset(1);
    }
    perspective(fov, aspect, near, far) {
        frustum.perspective(this._vertices_raw, fov, aspect, near, far);
        this._vertices = this._vertices_raw;
        this._faces_invalidated = true;
        this._hasChanged.reset(1);
    }
    transform(m) {
        for (let i = 0; i < this._vertices_raw.length; i++) {
            vec3.transformMat4(this._vertices_tra[i], this._vertices_raw[i], m);
        }
        this._vertices = this._vertices_tra;
        this._faces_invalidated = true;
        this._hasChanged.reset(1);
    }
    aabb_out(aabb) {
        return frustum.aabb_out(this.faces, aabb);
    }
    aabb_in(aabb) {
        return frustum.aabb_in(this.faces, aabb);
    }
}
