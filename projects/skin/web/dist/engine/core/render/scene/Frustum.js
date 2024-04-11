import { frustum } from "../../math/frustum.js";
import { plane } from "../../math/plane.js";
import { vec3 } from "../../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
export class Frustum extends FrameChangeRecord {
    constructor() {
        super(...arguments);
        this._vertices = frustum.vertices();
        this._faces_invalidated = true;
        this._faces = frustum.faces();
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
    fromOrthographic(left, right, bottom, top, near, far) {
        frustum.fromOrthographic(this._vertices, left, right, bottom, top, near, far);
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }
    fromPerspective(fov, aspect, near, far) {
        frustum.fromPerspective(this._vertices, fov, aspect, near, far);
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }
    transform(m) {
        for (let i = 0; i < this._vertices.length; i++) {
            vec3.transformMat4(this._vertices[i], this._vertices[i], m);
        }
        this._faces_invalidated = true;
        this.hasChanged = 1;
    }
    aabb(aabb) {
        for (const face of this.faces) {
            if (plane.aabb(face, aabb) == -1) {
                return 0;
            }
        }
        return 1;
    }
}
