import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { Component } from "../core/Component.js";
import { Zero } from "../core/Zero.js";
import { mat4 } from "../core/math/mat4.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { Camera as render_Camera } from "../core/render/scene/Camera.js";
import { TransformEvent } from "../core/render/scene/Transform.js";
const vec2_a = vec2.create();
var DirtyFlag;
(function (DirtyFlag) {
    DirtyFlag[DirtyFlag["NONE"] = 0] = "NONE";
    DirtyFlag[DirtyFlag["CALCULATING"] = 1] = "CALCULATING";
    DirtyFlag[DirtyFlag["COMMITTING"] = 2] = "COMMITTING";
    DirtyFlag[DirtyFlag["DIRTY"] = 3] = "DIRTY";
})(DirtyFlag || (DirtyFlag = {}));
export class Camera extends Component {
    constructor() {
        super(...arguments);
        this._matView = mat4.create();
        this._matViewFlags = DirtyFlag.DIRTY;
        this._matProj = mat4.create();
        this._matProjFlags = DirtyFlag.DIRTY;
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
        this.visibilities = VisibilityFlagBits.DEFAULT;
        this.clears = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;
        /**
         * x,y the lower left corner
         */
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
    }
    static get instances() {
        return this._instances;
    }
    start() {
        this.node.on(TransformEvent.TRANSFORM_CHANGED, () => this._matViewFlags = DirtyFlag.DIRTY);
        const camera = new render_Camera(this.node);
        camera.visibilities = this.visibilities;
        camera.clears = this.clears;
        camera.viewport = this.viewport;
        Zero.instance.scene.cameras.push(camera);
        this._camera = camera;
        Camera._instances.push(this);
    }
    lateUpdate() {
        if (this._matViewFlags & DirtyFlag.COMMITTING) {
            this._camera.matView = this.getMatView();
            this._matViewFlags ^= DirtyFlag.COMMITTING;
        }
        if (this._matProjFlags & DirtyFlag.COMMITTING) {
            this._camera.matProj = this.getMatProj();
            this._matProjFlags ^= DirtyFlag.COMMITTING;
        }
    }
    screenPointToRay(out_from, out_to, x, y) {
        this.screenToNdc(vec2_a, x, y);
        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);
        // ndc to world
        const matViewProj = mat4.multiply(mat4.create(), this.getMatProj(), this.getMatView());
        const matViewProjInv = mat4.invert(mat4.create(), matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }
    screenToWorld(out, x, y) {
        this.screenToNdc(vec2_a, x, y);
        const matViewProj = mat4.multiply(mat4.create(), this.getMatProj(), this.getMatView());
        const matViewProjInv = mat4.invert(mat4.create(), matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }
    screenToNdc(out, x, y) {
        y = device.swapchain.height - y;
        x -= this.viewport.x;
        y -= this.viewport.y;
        x /= this.viewport.width;
        y /= this.viewport.height;
        x = x * 2 - 1;
        y = y * 2 - 1;
        return vec2.set(out, x, y);
    }
    isPerspective() {
        if (this.fov != -1) {
            return true;
        }
        if (this.orthoSize != -1) {
            return false;
        }
        throw new Error("can't recognize projection type");
    }
    getMatView() {
        if (this._matViewFlags & DirtyFlag.CALCULATING) {
            mat4.invert(this._matView, this.node.world_matrix);
            this._matViewFlags ^= DirtyFlag.CALCULATING;
        }
        return this._matView;
    }
    getMatProj() {
        if (this._matProjFlags & DirtyFlag.CALCULATING) {
            const aspect = this.viewport.width / this.viewport.height;
            if (this.isPerspective()) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
            }
            else {
                const x = this.orthoSize * aspect;
                const y = this.orthoSize;
                mat4.ortho(this._matProj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
            }
            this._matProjFlags ^= DirtyFlag.CALCULATING;
        }
        return this._matProj;
    }
}
Camera.ClearFlagBits = ClearFlagBits;
Camera._instances = [];
