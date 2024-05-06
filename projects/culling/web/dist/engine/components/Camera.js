import { ClearFlagBits } from "gfx";
import { Component } from "../core/Component.js";
import { Zero } from "../core/Zero.js";
import { Camera as render_Camera } from "../core/render/scene/Camera.js";
export class Camera extends Component {
    constructor() {
        super(...arguments);
        this._camera = new render_Camera(this.node);
    }
    /**
     * half size of the vertical viewing volume
     */
    get orthoSize() {
        return this._camera.orthoSize;
    }
    set orthoSize(value) {
        this._camera.orthoSize = value;
    }
    /**
     * the vertical field of view
     */
    get fov() {
        return this._camera.fov;
    }
    set fov(value) {
        this._camera.fov = value;
    }
    get near() {
        return this._camera.near;
    }
    set near(value) {
        this._camera.near = value;
    }
    get far() {
        return this._camera.far;
    }
    set far(value) {
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
    get rect() {
        return this._camera.rect;
    }
    set rect(value) {
        this._camera.rect = value;
    }
    get aspect() {
        return this._camera.aspect;
    }
    get frustum() {
        return this._camera.frustum;
    }
    start() {
        Zero.instance.scene.addCamera(this._camera);
    }
}
Camera.ClearFlagBits = ClearFlagBits;
