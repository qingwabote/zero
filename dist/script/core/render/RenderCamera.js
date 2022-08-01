import gfx from "../gfx.js";
import { BufferUsageBit } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
import render from "../render.js";
export default class RenderCamera {
    _dirty = true;
    _orthoHeight = -1;
    get orthoHeight() {
        return this._orthoHeight;
    }
    set orthoHeight(value) {
        this._orthoHeight = value;
        this._dirty = true;
    }
    _fov = -1;
    get fov() {
        return this._fov;
    }
    set fov(value) {
        this._fov = value;
        this._dirty = true;
    }
    _viewport = { x: 0, y: 0, width: 1, height: 1 };
    get viewport() {
        return this._viewport;
    }
    set viewport(value) {
        this._viewport = value;
        this._dirty = true;
    }
    _matView = mat4.create();
    _matProj = mat4.create();
    _uboSrc;
    _ubo;
    get ubo() {
        return this._ubo;
    }
    _window;
    _transform;
    constructor(window, transform) {
        render.dirtyTransforms.set(transform, transform);
        this._uboSrc = new Float32Array(this._matView.length + this._matProj.length);
        this._ubo = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: this._uboSrc.byteLength });
        this._window = window;
        this._transform = transform;
    }
    update() {
        let uboDirty = false;
        let offset = 0;
        if (render.dirtyTransforms.has(this._transform)) {
            this._transform.updateMatrix();
            const matView = mat4.create();
            mat4.invert(matView, this._transform.matrix);
            this._uboSrc.set(matView, offset);
            uboDirty = true;
        }
        offset += 16;
        if (this._dirty) {
            const aspect = (this._window.width * this._viewport.width) / (this._window.height * this._viewport.height);
            if (this.orthoHeight != -1) {
                const x = this.orthoHeight * aspect;
                const y = this.orthoHeight;
                mat4.ortho(this._matProj, -x, x, -y, y, 1, 2000);
            }
            else if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, 1, 1000);
            }
            this._uboSrc.set(this._matProj, offset);
            uboDirty = true;
            this._dirty = false;
        }
        if (uboDirty) {
            this._ubo.update(this._uboSrc);
        }
    }
}
//# sourceMappingURL=RenderCamera.js.map