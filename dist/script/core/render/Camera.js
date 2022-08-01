import gfx from "../gfx.js";
import { BufferUsageBit } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
const float32Array = new Float32Array(16);
export default class Camera {
    _dirty = true;
    orthoHeight = -1;
    fov = -1;
    _viewport;
    get viewport() {
        return this._viewport;
    }
    _matProj = mat4.create();
    _ubo;
    get ubo() {
        return this._ubo;
    }
    _window;
    constructor(window, viewport = { x: 0, y: 0, width: 1, height: 1 }) {
        this._ubo = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: float32Array.byteLength });
        this._window = window;
        this._viewport = viewport;
    }
    update() {
        if (!this._dirty)
            return;
        const aspect = (this._window.width * this._viewport.width) / (this._window.height * this._viewport.height);
        if (this.orthoHeight != -1) {
            const x = this.orthoHeight * aspect;
            const y = this.orthoHeight;
            mat4.ortho(this._matProj, -x, x, -y, y, 1, 2000);
        }
        else if (this.fov != -1) {
            mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, 1, 1000);
        }
        float32Array.set(this._matProj);
        this._ubo.update(float32Array);
        this._dirty = false;
    }
}
//# sourceMappingURL=Camera.js.map