import { ClearFlagBit } from "../gfx/Pipeline.js";
import { Mat4 } from "../math/mat4.js";
import { Rect } from "../math/rect.js";
import { RenderNode } from "./RenderNode.js";
import VisibilityBit from "./VisibilityBit.js";

export default class RenderCamera {

    visibilities: VisibilityBit = VisibilityBit.DEFAULT;

    clearFlags: ClearFlagBit = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;

    viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };

    private _matView!: Mat4;
    get matView(): Mat4 {
        return this._matView;
    }
    set matView(value: Mat4) {
        this._matView = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _matProj!: Mat4;
    get matProj(): Mat4 {
        return this._matProj;
    }
    set matProj(value: Mat4) {
        this._matProj = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _node: RenderNode;
    get node(): RenderNode {
        return this._node;
    }

    constructor(node: RenderNode) {
        this._node = node;
    }
}