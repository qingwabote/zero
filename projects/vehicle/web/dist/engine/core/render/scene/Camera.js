import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { mat4 } from "../../math/mat4.js";
import { vec2 } from "../../math/vec2.js";
import { vec3 } from "../../math/vec3.js";
import { vec4 } from "../../math/vec4.js";
import { Frustum } from "./Frustum.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
const vec2_a = vec2.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();
var ChangeBit;
(function (ChangeBit) {
    ChangeBit[ChangeBit["NONE"] = 0] = "NONE";
    ChangeBit[ChangeBit["PROJ"] = 1] = "PROJ";
    ChangeBit[ChangeBit["VIEW"] = 2] = "VIEW";
})(ChangeBit || (ChangeBit = {}));
export class Camera {
    get view() {
        return this._view;
    }
    get proj() {
        return this._proj;
    }
    /**
     * half size of the vertical viewing volume
     */
    get orthoSize() {
        return this._orthoSize;
    }
    set orthoSize(value) {
        this._orthoSize = value;
        this._proj_invalidated = true;
    }
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
        const { width, height } = device.swapchain.color.info;
        return (width * this._rect[2]) / (height * this._rect[3]);
    }
    get hasChangedFlag() {
        return this._hasChangedFlag;
    }
    constructor(transform) {
        this.transform = transform;
        this._view_invalidated = true;
        this._view = mat4.create();
        this._proj_invalidated = true;
        this._proj = mat4.create();
        this.frustum = new Frustum;
        this._orthoSize = -1;
        /**
         * the vertical field of view
         */
        this.fov = -1;
        this.near = 1;
        this.far = 1000;
        this.visibilities = 0;
        this.clears = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;
        this._rect = vec4.create(0, 0, 1, 1);
        this._hasChangedFlag = new PeriodicFlag(0xffffffff);
    }
    update() {
        if (this.transform.hasChangedFlag.value) {
            this._view_invalidated = true;
        }
        if (this._proj_invalidated) {
            if (this.fov != -1) {
                mat4.perspective(this._proj, Math.PI / 180 * this.fov, this.aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.perspective(Math.PI / 180 * this.fov, this.aspect, this.near, this.far);
            }
            else {
                const x = this._orthoSize * this.aspect;
                const y = this._orthoSize;
                mat4.orthographic(this._proj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.orthographic(-x, x, -y, y, this.near, this.far);
            }
            this._hasChangedFlag.addBit(ChangeBit.PROJ);
        }
        if (this._view_invalidated) {
            mat4.invert(this._view, this.transform.world_matrix);
            this._hasChangedFlag.addBit(ChangeBit.VIEW);
        }
        if (this._proj_invalidated || this._view_invalidated) {
            this.frustum.transform(this.transform.world_matrix);
        }
        this._proj_invalidated = this._view_invalidated = false;
    }
    screenPointToRay(out_from, out_to, x, y) {
        this.screenToNdc(vec2_a, x, y);
        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);
        // ndc to world
        const matViewProj = mat4.multiply(mat4_a, this._proj, this._view);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }
    screenToWorld(out, x, y) {
        this.screenToNdc(vec2_a, x, y);
        const matViewProj = mat4.multiply(mat4_a, this._proj, this._view);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }
    screenToNdc(out, x, y) {
        const { width, height } = device.swapchain.color.info;
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
Camera.ChangeBit = ChangeBit;
