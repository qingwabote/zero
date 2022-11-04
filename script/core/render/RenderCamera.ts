import { ClearFlagBit } from "../gfx/Pipeline.js";
import mat4, { Mat4 } from "../math/mat4.js";
import { Rect } from "../math/rect.js";
import vec3, { Vec3 } from "../math/vec3.js";
import { RenderNode } from "./RenderNode.js";
import RenderWindow from "./RenderWindow.js";
import VisibilityBit from "./VisibilityBit.js";

export default class RenderCamera {
    private _dirty = true;

    private _orthoHeight = -1;
    get orthoHeight(): number {
        return this._orthoHeight;
    }
    set orthoHeight(value: number) {
        this._orthoHeight = value;
        this._dirty = true;
    }

    private _fov = -1;
    get fov(): number {
        return this._fov;
    }
    set fov(value: number) {
        this._fov = value;
        this._dirty = true;
    }

    visibilities: VisibilityBit = VisibilityBit.DEFAULT;

    clearFlags: ClearFlagBit = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;

    private _viewport: Rect = { x: 0, y: 0, width: 1, height: 1 };
    get viewport(): Readonly<Rect> {
        return this._viewport
    }
    set viewport(value: Readonly<Rect>) {
        this._viewport = value;
        this._dirty = true;
    }

    private _view = mat4.create();
    get view(): Mat4 {
        return this._view;
    }

    private _projection = mat4.create();
    get projection(): Mat4 {
        return this._projection;
    }

    private _position: Vec3 = vec3.create();
    get position(): Vec3 {
        return this._position;
    }

    private _window: RenderWindow;

    private _node: RenderNode;

    constructor(window: RenderWindow, node: RenderNode) {
        zero.renderScene.dirtyTransforms.set(node, node);

        this._window = window;
        this._node = node;
    }

    update(): boolean {
        let dataDirty = false;

        if (zero.renderScene.dirtyTransforms.has(this._node)) {
            this._node.updateTransform();
            mat4.invert(this._view, this._node.matrix);
            vec3.transformMat4(this._position, vec3.zero, this._node.matrix);

            dataDirty = true;
        }

        if (this._dirty) {
            const aspect = (this._window.width * this._viewport.width) / (this._window.height * this._viewport.height);
            if (this.orthoHeight != -1) {
                const x = this.orthoHeight * aspect;
                const y = this.orthoHeight;
                mat4.ortho(this._projection, -x, x, -y, y, 1, 2000, gfx.capabilities.clipSpaceMinZ);
            } else if (this.fov != -1) {
                mat4.perspective(this._projection, Math.PI / 180 * this.fov, aspect, 1, 1000);
            }

            dataDirty = true;
            this._dirty = false;
        }

        return dataDirty;
    }
}