import { device } from "boot";
import { ClearFlagBits } from "gfx";
import { Component } from "../core/Component.js";
import { Zero } from "../core/Zero.js";
import { rect } from "../core/math/rect.js";
import { Camera as render_Camera } from "../core/render/scene/Camera.js";
const rect_a = rect.create();
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
    get viewport() {
        const { width, height } = device.swapchain;
        const viewport = this._camera.viewport;
        rect.set(rect_a, viewport.x / width, viewport.y / height, viewport.width / width, viewport.height / height);
        return rect_a;
    }
    set viewport(value) {
        const { width, height } = device.swapchain;
        rect.set(rect_a, width * value.x, height * value.y, width * value.width, height * value.height);
        this._camera.viewport = rect_a;
    }
    get aspect() {
        return this._camera.aspect;
    }
    start() {
        Zero.instance.scene.cameras.push(this._camera);
    }
    lateUpdate() {
        this._camera.update();
    }
}
Camera.ClearFlagBits = ClearFlagBits;
