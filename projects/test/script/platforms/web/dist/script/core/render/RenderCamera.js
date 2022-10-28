import { ClearFlagBit } from "../gfx/Pipeline.js";
import mat4 from "../math/mat4.js";
import vec3 from "../math/vec3.js";
import VisibilityBit from "./VisibilityBit.js";
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
    visibilities = VisibilityBit.DEFAULT;
    clearFlags = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;
    _viewport = { x: 0, y: 0, width: 1, height: 1 };
    get viewport() {
        return this._viewport;
    }
    set viewport(value) {
        this._viewport = value;
        this._dirty = true;
    }
    _matView = mat4.create();
    get matView() {
        return this._matView;
    }
    _matProj = mat4.create();
    get matProj() {
        return this._matProj;
    }
    _position = vec3.create();
    get position() {
        return this._position;
    }
    _window;
    _node;
    constructor(window, node) {
        zero.dirtyTransforms.set(node, node);
        this._window = window;
        this._node = node;
    }
    update() {
        let dataDirty = false;
        if (zero.dirtyTransforms.has(this._node)) {
            this._node.updateMatrix();
            mat4.invert(this._matView, this._node.matrix);
            vec3.transformMat4(this._position, vec3.create(0, 0, 0), this._node.matrix);
            dataDirty = true;
        }
        if (this._dirty) {
            const aspect = (this._window.width * this._viewport.width) / (this._window.height * this._viewport.height);
            if (this.orthoHeight != -1) {
                const x = this.orthoHeight * aspect;
                const y = this.orthoHeight;
                mat4.ortho(this._matProj, -x, x, -y, y, 1, 2000, gfx.capabilities.clipSpaceMinZ);
            }
            else if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, 1, 1000);
            }
            dataDirty = true;
            this._dirty = false;
        }
        return dataDirty;
    }
}
//# sourceMappingURL=RenderCamera.js.map