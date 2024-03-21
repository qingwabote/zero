import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { Mat4, mat4 } from "../../math/mat4.js";
import { Rect, rect } from "../../math/rect.js";
import { Vec2Like, vec2 } from "../../math/vec2.js";
import { Vec3, Vec3Like, vec3 } from "../../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Transform } from "./Transform.js";

const vec2_a = vec2.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();

export class Camera extends FrameChangeRecord {

    override get hasChanged(): number {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    override set hasChanged(flags: number) {
        super.hasChanged = flags;
    }

    /**
     * half size of the vertical viewing volume
     */
    orthoSize = -1;
    /**
     * the vertical field of view
     */
    fov = -1;
    near = 1;
    far = 1000;

    visibilities = 0;

    clears: ClearFlagBits = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;

    private _viewport = rect.create(0, 0, device.swapchain.width, device.swapchain.height);
    /**
     * x,y the lower left corner
     */
    public get viewport(): Readonly<Rect> {
        return this._viewport;
    }
    public set viewport(value: Readonly<Rect>) {
        rect.copy(this._viewport, value);
    }

    get aspect(): number {
        return this._viewport.width / this._viewport.height;
    }

    private _matView = mat4.create();
    get matView(): Readonly<Mat4> {
        return this._matView;
    }

    private _matProj = mat4.create();
    get matProj(): Readonly<Mat4> {
        return this._matProj;
    }

    get position(): Readonly<Vec3> {
        return this._transform.world_position;
    }

    constructor(private _transform: Transform) {
        super();
    }

    update() {
        if (this.hasChanged) {
            mat4.invert(this._matView, this._transform.world_matrix);

            if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, this.aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
            } else {
                const x = this.orthoSize * this.aspect;
                const y = this.orthoSize;
                mat4.ortho(this._matProj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
            }
        }
    }

    screenPointToRay(out_from: Vec3Like, out_to: Vec3Like, x: number, y: number) {
        this.screenToNdc(vec2_a, x, y);

        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);

        // ndc to world
        const matViewProj = mat4.multiply(mat4_a, this._matProj, this._matView);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }

    screenToWorld<Out extends Vec2Like>(out: Out, x: number, y: number): Out {
        this.screenToNdc(vec2_a, x, y);

        const matViewProj = mat4.multiply(mat4_a, this._matProj, this._matView);
        const matViewProjInv = mat4.invert(mat4_b, matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }

    private screenToNdc(out: Vec2Like, x: number, y: number): Vec2Like {
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