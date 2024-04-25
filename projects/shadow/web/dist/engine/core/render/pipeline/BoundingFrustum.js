import { device } from "boot";
import { aabb3d } from "../../math/aabb3d.js";
import { frustum } from "../../math/frustum.js";
import { mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { FrameChangeRecord } from "../scene/FrameChangeRecord.js";
import { Frustum } from "../scene/Frustum.js";
import { root } from "../scene/Root.js";
const vec3_a = vec3.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();
const frustum_a = frustum.vertices();
const aabb_a = aabb3d.create();
export class BoundingFurstum extends FrameChangeRecord {
    get hasChanged() {
        return super.hasChanged || this._camera.hasChanged || this._camera.transform.hasChanged || root.directionalLight.hasChanged;
    }
    set hasChanged(flags) {
        super.hasChanged = flags;
    }
    get viewProj() {
        return this._viewProj;
    }
    get frustum() {
        if (this._start != 0 || this._end != 1) {
            return this._frustum;
        }
        else {
            return this._camera.frustum;
        }
    }
    constructor(_camera, _start = 0, _end = 1) {
        super(1);
        this._camera = _camera;
        this._start = _start;
        this._end = _end;
        this._viewProj = mat4.create();
        this.bounds = new Frustum;
        if (this._start != 0 || this._end != 1) {
            this._frustum = new Frustum;
        }
    }
    update(dumping) {
        if (!dumping && !this.hasChanged) {
            return;
        }
        const light = root.directionalLight;
        let f;
        if (this._start != 0 || this._end != 1) {
            if (this._camera.hasChanged) {
                const d = this._camera.far - this._camera.near;
                this._frustum.perspective(Math.PI / 180 * this._camera.fov, this._camera.aspect, this._camera.near + d * this._start, this._camera.near + d * this._end);
            }
            if (this._camera.hasChanged || this._camera.transform.hasChanged) {
                this._frustum.transform(this._camera.transform.world_matrix);
            }
            f = this._frustum;
        }
        else {
            f = this._camera.frustum;
        }
        frustum.transform(frustum_a, f.vertices, light.view);
        aabb3d.fromPoints(aabb_a, frustum_a);
        vec3.set(vec3_a, aabb_a.center[0], aabb_a.center[1], aabb_a.center[2] + aabb_a.halfExtent[2]);
        vec3.transformMat4(vec3_a, vec3_a, light.model);
        mat4.translate(mat4_a, light.model, vec3_a);
        const left = -aabb_a.halfExtent[0];
        const right = aabb_a.halfExtent[0];
        const bottom = -aabb_a.halfExtent[1];
        const top = aabb_a.halfExtent[1];
        const near = 0;
        const far = aabb_a.halfExtent[2] * 2;
        mat4.ortho(mat4_b, left, right, bottom, top, near, far, device.capabilities.clipSpaceMinZ);
        this.bounds.orthographic(left, right, bottom, top, near, far);
        this.bounds.transform(mat4_a);
        mat4.multiply(this._viewProj, mat4_b, mat4.invert(mat4_a, mat4_a));
    }
}
