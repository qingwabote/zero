import { AABB3D } from "../../math/aabb3d.js";
import { FrustumFaces, FrustumVertices, frustum } from "../../math/frustum.js";
import { Mat4 } from "../../math/mat4.js";
import { plane } from "../../math/plane.js";
import { vec3 } from "../../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";

export class Frustum extends FrameChangeRecord {
    private _vertices = frustum.vertices();
    public get vertices(): Readonly<FrustumVertices> {
        return this._vertices;
    }

    private _faces_invalidated = true;
    private _faces = frustum.faces();
    public get faces(): Readonly<FrustumFaces> {
        if (!this._faces_invalidated) {
            return this._faces;
        }
        frustum.toFaces(this._faces, this._vertices);
        this._faces_invalidated = false;
        return this._faces
    }

    fromOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        frustum.fromOrthographic(this._vertices, left, right, bottom, top, near, far)
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    fromPerspective(fov: number, aspect: number, near: number, far: number) {
        frustum.fromPerspective(this._vertices, fov, aspect, near, far);
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    transform(m: Readonly<Mat4>) {
        for (let i = 0; i < this._vertices.length; i++) {
            vec3.transformMat4(this._vertices[i], this._vertices[i], m);
        }
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }

    aabb(aabb: Readonly<AABB3D>): number {
        for (const face of this.faces) {
            if (plane.aabb(face, aabb) == -1) {
                return 0;
            }
        }
        return 1
    }
}