import { ClearFlagBits } from "gfx";
import { Component } from "../core/Component.js";
import { Rect } from "../core/math/rect.js";
import { Camera as render_Camera } from "../core/render/scene/Camera.js";

export class Camera extends Component {
    static readonly ClearFlagBits = ClearFlagBits;

    private _camera: render_Camera = new render_Camera(this.node);
    /**
     * half size of the vertical viewing volume
     */
    public get orthoSize() {
        return this._camera.orthoSize;
    }
    public set orthoSize(value) {
        this._camera.orthoSize = value;
    }
    /**
     * the vertical field of view
     */
    public get fov() {
        return this._camera.fov;
    }
    public set fov(value) {
        this._camera.fov = value;
    }

    public get near() {
        return this._camera.near;
    }
    public set near(value) {
        this._camera.near = value;
    }

    public get far() {
        return this._camera.far;
    }
    public set far(value) {
        this._camera.far = value;
    }

    get visibilities() {
        return this._camera.visibilities;
    }
    set visibilities(value) {
        this._camera.visibilities = value;
    }

    get clears() {
        return this._camera.clears;
    }
    set clears(value) {
        this._camera.clears = value;
    }

    /**
     * the bottom-left of the swapchain is (0,0) and the top-right of the swapchain is (1,1)
     */
    get rect(): Readonly<Rect> {
        return this._camera.rect;
    }
    set rect(value: Readonly<Rect>) {
        this._camera.rect = value;
    }

    get aspect(): number {
        return this._camera.aspect;
    }

    get frustum_vertices() {
        return this._camera.frustum_vertices;
    }

    get frustum_faces() {
        return this._camera.frustum_faces;
    }
}