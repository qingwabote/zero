import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { mat4 } from "../../math/mat4.js";
import { rect } from "../../math/rect.js";
import { vec2 } from "../../math/vec2.js";
import { vec3 } from "../../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
const vec2_a = vec2.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();
export class Camera extends FrameChangeRecord {
    get hasChanged() {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    set hasChanged(flags) {
        super.hasChanged = flags;
    }
    /**
     * x,y the lower left corner
     */
    get viewport() {
        return this._viewport;
    }
    set viewport(value) {
        rect.copy(this._viewport, value);
    }
    get aspect() {
        return this._viewport.width / this._viewport.height;
    }
    get matView() {
        return this._matView;
    }
    get matProj() {
        return this._matProj;
    }
    get position() {
        return this._transform.world_position;
    }
    constructor(_transform) {
        super();
        this._transform = _transform;
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
        this._viewport = rect.create(0, 0, device.swapchain.width, device.swapchain.height);
        this._matView = mat4.create();
        this._matProj = mat4.create();
    }
    update() {
        if (this.hasChanged) {
            mat4.invert(this._matView, this._transform.world_matrix);
            if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, this.aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
            }
            else {
                const x = this.orthoSize * this.aspect;
                const y = this.orthoSize;
                mat4.ortho(this._matProj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
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
        y = device.swapchain.height - y;
        const viewport = this._viewport;
        x -= viewport.x;
        y -= viewport.y;
        x /= viewport.width;
        y /= viewport.height;
        x = x * 2 - 1;
        y = y * 2 - 1;
        return vec2.set(out, x, y);
    }
}
