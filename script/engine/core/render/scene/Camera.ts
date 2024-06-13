import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { Mat4, mat4 } from "../../math/mat4.js";
import { Vec2Like, vec2 } from "../../math/vec2.js";
import { Vec3Like, vec3 } from "../../math/vec3.js";
import { Vec4, vec4 } from "../../math/vec4.js";
import { Frustum } from "./Frustum.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
import { Transform } from "./Transform.js";

const vec2_a = vec2.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();

enum ChangeBit {
    NONE = 0,
    PROJ = 1 << 0,
    VIEW = 1 << 1,
}

export class Camera {
    private _view_invalidated = true;
    private _view = mat4.create();
    get view(): Readonly<Mat4> {
        return this._view;
    }

    private _proj_invalidated = true;
    private _proj = mat4.create();
    get proj(): Readonly<Mat4> {
        return this._proj;
    }

    readonly frustum: Readonly<Frustum> = new Frustum;

    private _orthoSize = -1;
    /**
     * half size of the vertical viewing volume
     */
    public get orthoSize() {
        return this._orthoSize;
    }
    public set orthoSize(value) {
        this._orthoSize = value;
        this._proj_invalidated = true;
    }
    /**
     * the vertical field of view
     */
    fov = -1;
    near = 1;
    far = 1000;

    visibilities = 0;

    clears: ClearFlagBits = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;

    private _rect = vec4.create(0, 0, 1, 1);
    /**
     * x,y the lower left corner
     */
    public get rect(): Readonly<Vec4> {
        return this._rect;
    }
    public set rect(value: Readonly<Vec4>) {
        vec4.copy(this._rect, value);
    }

    get aspect(): number {
        const { width, height } = device.swapchain
        return (width * this._rect[2]) / (height * this._rect[3]);
    }

    private _hasChanged = new PeriodicFlag(0xffffffff)
    get hasChanged(): ChangeBit {
        return this._hasChanged.value;
    }

    constructor(readonly transform: Transform) { }

    update() {
        if (this.transform.hasChanged) {
            this._view_invalidated = true;
        }

        if (this._proj_invalidated) {
            if (this.fov != -1) {
                mat4.perspective(this._proj, Math.PI / 180 * this.fov, this.aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.perspective(Math.PI / 180 * this.fov, this.aspect, this.near, this.far);
            } else {
                const x = this._orthoSize * this.aspect;
                const y = this._orthoSize;
                mat4.orthographic(this._proj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
                this.frustum.orthographic(-x, x, -y, y, this.near, this.far);
            }

            this._hasChanged.addBit(ChangeBit.PROJ);
        }

        if (this._view_invalidated) {
            mat4.invert(this._view, this.transform.world_matrix);
            this._hasChanged.addBit(ChangeBit.VIEW);
        }

        if (this._proj_invalidated || this._view_invalidated) {
            this.frustum.transform(this.transform.world_matrix);
        }

        this._proj_invalidated = this._view_invalidated = false;
    }

    screenPointToRay(out_from: Vec3Like, out_to: Vec3Like, x: number, y: number) {
        this.screenToNdc(vec2_a, x, y);

        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);

        // ndc to world
        const matViewProj = mat4.multiply(mat4_a, this._proj, this._view);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }

    screenToWorld<Out extends Vec2Like>(out: Out, x: number, y: number): Out {
        this.screenToNdc(vec2_a, x, y);

        const matViewProj = mat4.multiply(mat4_a, this._proj, this._view);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }

    private screenToNdc(out: Vec2Like, x: number, y: number): Vec2Like {
        const { width, height } = device.swapchain

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

export declare namespace Camera {
    export { ChangeBit }
}