import { ClearFlagBits } from "gfx-main";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { Component } from "../core/Component.js";
import { Zero } from "../core/Zero.js";
import { device } from "../core/impl.js";
import { Mat4Like, mat4 } from "../core/math/mat4.js";
import { Rect } from "../core/math/rect.js";
import { Vec2Like, vec2 } from "../core/math/vec2.js";
import { Vec3Like, vec3 } from "../core/math/vec3.js";
import { Camera as render_Camera } from "../core/render/scene/Camera.js";
import { TransformEvent } from "../core/render/scene/Transform.js";

const vec2_a = vec2.create();

enum DirtyFlag {
    NONE = 0,
    CALCULATING = 0x1,
    COMMITTING = 0x2,
    DIRTY = CALCULATING | COMMITTING
}

export class Camera extends Component {
    static _instances: Camera[] = [];
    static get instances(): readonly Camera[] {
        return this._instances;
    }

    private _matView: Mat4Like = mat4.create();
    private _matViewFlags: DirtyFlag = DirtyFlag.DIRTY;

    private _matProj: Mat4Like = mat4.create();
    private _matProjFlags: DirtyFlag = DirtyFlag.DIRTY;

    orthoHeight = -1;
    fov = -1;
    near = 1;
    far = 1000;

    visibilityFlags: VisibilityFlagBits = VisibilityFlagBits.DEFAULT;

    clearFlags: ClearFlagBits = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;

    /**
     * x,y the lower left corner
     */
    viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };

    private _camera!: render_Camera;

    override start(): void {
        this.node.on(TransformEvent.TRANSFORM_CHANGED, () => this._matViewFlags = DirtyFlag.DIRTY);

        const camera = new render_Camera(this.node);
        camera.visibilityFlags = this.visibilityFlags;
        camera.clearFlags = this.clearFlags;
        camera.viewport = this.viewport;
        Zero.instance.scene.cameras.push(camera);
        this._camera = camera;

        Camera._instances.push(this);
    }

    override lateUpdate(): void {
        if (this._matViewFlags & DirtyFlag.COMMITTING) {
            this._camera.matView = this.getMatView();
            this._matViewFlags ^= DirtyFlag.COMMITTING;
        }
        if (this._matProjFlags & DirtyFlag.COMMITTING) {
            this._camera.matProj = this.getMatProj();
            this._matProjFlags ^= DirtyFlag.COMMITTING;
        }
    }

    screenPointToRay(out_from: Vec3Like, out_to: Vec3Like, x: number, y: number) {
        this.screenToNdc(vec2_a, x, y);

        vec3.set(out_from, vec2_a[0], vec2_a[1], -1);
        vec3.set(out_to, vec2_a[0], vec2_a[1], 1);

        // ndc to world
        const matViewProj = mat4.multiply(mat4.create(), this.getMatProj(), this.getMatView());
        const matViewProjInv = mat4.invert(mat4.create(), matViewProj);
        vec3.transformMat4(out_from, out_from, matViewProjInv);
        vec3.transformMat4(out_to, out_to, matViewProjInv);
    }

    screenToWorld<Out extends Vec2Like>(out: Out, x: number, y: number): Out {
        this.screenToNdc(vec2_a, x, y);

        const matViewProj = mat4.multiply(mat4.create(), this.getMatProj(), this.getMatView());
        const matViewProjInv = mat4.invert(mat4.create(), matViewProj);
        return vec2.transformMat4(out, vec2_a, matViewProjInv);
    }

    private screenToNdc(out: Vec2Like, x: number, y: number): Vec2Like {
        y = device.swapchain.height - y;

        x -= this.viewport.x;
        y -= this.viewport.y;

        x /= this.viewport.width;
        y /= this.viewport.height;

        x = x * 2 - 1;
        y = y * 2 - 1;

        return vec2.set(out, x, y);
    }

    private isPerspective(): boolean {
        if (this.fov != -1) {
            return true;
        }
        if (this.orthoHeight != -1) {
            return false;
        }
        throw new Error("can't recognize projection type");
    }

    private getMatView(): Mat4Like {
        if (this._matViewFlags & DirtyFlag.CALCULATING) {
            mat4.invert(this._matView, this.node.world_matrix)
            this._matViewFlags ^= DirtyFlag.CALCULATING;
        }
        return this._matView;
    }

    private getMatProj(): Mat4Like {
        if (this._matProjFlags & DirtyFlag.CALCULATING) {
            const aspect = this.viewport.width / this.viewport.height;
            if (this.isPerspective()) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, this.near, this.far, device.capabilities.clipSpaceMinZ);
            } else {
                const x = this.orthoHeight * aspect;
                const y = this.orthoHeight;
                mat4.ortho(this._matProj, -x, x, -y, y, this.near, this.far, device.capabilities.clipSpaceMinZ);
            }

            this._matProjFlags ^= DirtyFlag.CALCULATING;
        }

        return this._matProj;
    }
}