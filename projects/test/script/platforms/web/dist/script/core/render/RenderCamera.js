import { ClearFlagBit } from "../gfx/Pipeline.js";
import { PhaseBit } from "./RenderPhase.js";
import VisibilityBit from "./VisibilityBit.js";
export default class RenderCamera {
    _orthoHeight = -1;
    get orthoHeight() {
        return this._orthoHeight;
    }
    set orthoHeight(value) {
        this._orthoHeight = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }
    _fov = -1;
    get fov() {
        return this._fov;
    }
    set fov(value) {
        this._fov = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }
    _near = 1;
    get near() {
        return this._near;
    }
    set near(value) {
        this._near = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }
    _far = 1000;
    get far() {
        return this._far;
    }
    set far(value) {
        this._far = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }
    visibilities = VisibilityBit.DEFAULT;
    phases = PhaseBit.DEFAULT;
    clearFlags = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;
    _viewport = { x: 0, y: 0, width: 0, height: 0 };
    get viewport() {
        return this._viewport;
    }
    set viewport(value) {
        this._viewport = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }
    _window;
    get window() {
        return this._window;
    }
    _node;
    get node() {
        return this._node;
    }
    constructor(window, node) {
        zero.renderScene.dirtyObjects.set(node, node);
        this._window = window;
        this._node = node;
    }
}
//# sourceMappingURL=RenderCamera.js.map