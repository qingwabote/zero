import { AABB3D } from "../../math/aabb3d.js";
import { frustum } from "../../math/frustum.js";
import { Mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { ChangeRecord } from "./ChangeRecord.js";

export class Frustum extends ChangeRecord {
    private _vertices_raw = frustum.vertices();
    private _vertices_tra = frustum.vertices();
    private _vertices = this._vertices_raw;
    public get vertices(): Readonly<frustum.Vertices> {
        return this._vertices;
    }

    private _faces_invalidated = true;
    private _faces = frustum.faces();
    public get faces(): Readonly<frustum.Faces> {
        if (!this._faces_invalidated) {
            return this._faces;
        }
        frustum.toFaces(this._faces, this._vertices);
        this._faces_invalidated = false;
        return this._faces
    }

    orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        frustum.orthographic(this._vertices_raw, left, right, bottom, top, near, far)
        this._vertices = this._vertices_raw;
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    perspective(fov: number, aspect: number, near: number, far: number) {
        frustum.perspective(this._vertices_raw, fov, aspect, near, far);
        this._vertices = this._vertices_raw;
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    transform(m: Readonly<Mat4>) {
        for (let i = 0; i < this._vertices_raw.length; i++) {
            vec3.transformMat4(this._vertices_tra[i], this._vertices_raw[i], m);
        }
        this._vertices = this._vertices_tra;
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    aabb_out(aabb: Readonly<AABB3D>): boolean {
        return frustum.aabb_out(this.faces, aabb);
    }

    aabb_in(aabb: Readonly<AABB3D>): boolean {
        return frustum.aabb_in(this.faces, aabb);
    }
}