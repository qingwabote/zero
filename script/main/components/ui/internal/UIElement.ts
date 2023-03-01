import Component from "../../../core/Component.js";
import rect, { Rect } from "../../../core/math/rect.js";
import vec2 from "../../../core/math/vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();

export enum DirtyFlag {
    NONE = 0,
    SIZE = 1 << 0,
    ANCHOR = 1 << 1,
    ALL = 0xffffffff
}

export default class UIElement extends Component {
    protected _dirtyFlags = DirtyFlag.ALL;

    private _size = vec2.create();
    public get size() {
        return this._size;
    }
    public set size(value) {
        this._size = value;
        this._dirtyFlags |= DirtyFlag.SIZE;
    }

    protected _anchor = vec2.create(0.5, 0.5);
    public get anchor() {
        return this._anchor;
    }
    public set anchor(value) {
        this._anchor = value;
        this._dirtyFlags |= DirtyFlag.ANCHOR;
    }

    getAABB(): Rect {
        const [x, y, width, height] = [-this.size[0] * this.anchor[0], -this.size[1] * this.anchor[1], this.size[0], this.size[1]];

        const lb = vec2.set(vec2_a, x, y);
        const rb = vec2.set(vec2_b, x + width, y)
        const rt = vec2.set(vec2_c, x + width, y + height)
        const lt = vec2.set(vec2_d, x, y + height)

        vec2.transformMat4(lb, lb, this.node.matrix);
        vec2.transformMat4(rb, rb, this.node.matrix);
        vec2.transformMat4(rt, rt, this.node.matrix);
        vec2.transformMat4(lt, lt, this.node.matrix);

        const l = Math.min(lb[0], rb[0], rt[0], lt[0]);
        const r = Math.max(lb[0], rb[0], rt[0], lt[0]);
        const t = Math.min(lb[1], rb[1], rt[1], lt[1]);
        const b = Math.max(lb[1], rb[1], rt[1], lt[1]);

        return rect.create(l, b, r - l, t - b);
    }
}