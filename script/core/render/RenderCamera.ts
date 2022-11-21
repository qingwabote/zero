import { ClearFlagBit } from "../gfx/Pipeline.js";
import { Rect } from "../math/rect.js";
import { RenderNode } from "./RenderNode.js";
import { PhaseBit } from "./RenderPhase.js";
import RenderWindow from "./RenderWindow.js";
import VisibilityBit from "./VisibilityBit.js";

export default class RenderCamera {
    private _orthoHeight = -1;
    get orthoHeight(): number {
        return this._orthoHeight;
    }
    set orthoHeight(value: number) {
        this._orthoHeight = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _fov = -1;
    get fov(): number {
        return this._fov;
    }
    set fov(value: number) {
        this._fov = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _near: number = 1;
    get near(): number {
        return this._near;
    }
    set near(value: number) {
        this._near = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _far: number = 1000;
    get far(): number {
        return this._far;
    }
    set far(value: number) {
        this._far = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    visibilities: VisibilityBit = VisibilityBit.DEFAULT;

    phases: PhaseBit = PhaseBit.DEFAULT;

    clearFlags: ClearFlagBit = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;

    private _viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };
    get viewport(): Readonly<Rect> {
        return this._viewport
    }
    set viewport(value: Readonly<Rect>) {
        this._viewport = value;
        zero.renderScene.dirtyObjects.set(this, this);
    }

    private _window: RenderWindow;
    get window(): RenderWindow {
        return this._window;
    }

    private _node: RenderNode;
    get node(): RenderNode {
        return this._node;
    }

    constructor(window: RenderWindow, node: RenderNode) {
        zero.renderScene.dirtyObjects.set(node, node);

        this._window = window;
        this._node = node;
    }
}