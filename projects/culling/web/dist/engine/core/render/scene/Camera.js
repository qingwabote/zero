import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { mat4 } from "../../math/mat4.js";
import { vec2 } from "../../math/vec2.js";
import { vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { ChangeRecord } from "./ChangeRecord.js";
import { Frustum } from "./Frustum.js";
const vec2_a = vec2.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();
export class Camera extends ChangeRecord {
    /**
     * x,y the lower left corner
     */
    get rect() {
        return this._rect;
    }
    set rect(value) {
        vec4.copy(this._rect, value);
    }
    get aspect() {
        const { width, height } = device.swapchain;
        return (width * this._rect[2]) / (height * this._rect[3]);
    }
    get matView() {
        return this._matView;
    }
    get matProj() {
        return this._matProj;
    }
    get position() {
        return this.transform.world_position;
    }
    constructor(transform) {
        super(1);
        this.transform = transform;
        /**
         * half size of the vertical viewing volume
         */
        this.orthoSize = -1;
        /**
         * the vertical field of view
         */
        this.fov = -1;
        this.near = 1;
        this.far = 1000;
        this.visibilities = 0;
        this.clears = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;
        this._rect = vec4.create(0, 0, 1, 1);
        this._matView = mat4.create();
        this._matProj = mat4.create();
        this.frustum = new Frustum;
    }
    update() {
        if (this.hasChanged) {
            if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, this.aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.perspective(Math.PI / 180 * this.fov, this.aspect, this.near, this.far);
            }
            else {
                const x = this.orthoSize * this.aspect;
                const y = this.orthoSize;
                mat4.orthographic(this._matProj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.orthographic(-x, x, -y, y, this.near, this.far);
            }
        }
        if (this.hasChanged || this.transform.hasChanged) {
            this.frustum.transform(this.transform.world_matrix);
            if (this.transform.hasChanged) {
                mat4.invert(this._matView, this.transform.world_matrix);
            }
        }
    }
    screenPointToRay(out_from, out_to, x, y) {
        this.screenToNdc(vec2_a, x, y);
        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);
        // ndc to world
        const matViewProj = mat4.multiply(mat4_a, this._matProj, this._matView);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }
    screenToWorld(out, x, y) {
        this.screenToNdc(vec2_a, x, y);
        const matViewProj = mat4.multiply(mat4_a, this._matProj, this._matView);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }
    screenToNdc(out, x, y) {
        const { width, height } = device.swapchain;
        y = height - y;
        x -= width * this._rect[0];
        y -= height * this._rect[1];
        x /= width * this._rect[2];
        y /= height * this._rect[3];
        x = x * 2 - 1;
        y = y * 2 - 1;
        return vec2.set(out, x, y);
    }
}
