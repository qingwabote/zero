import rect, { Rect } from "../../core/math/rect.js";
import vec2, { Vec2Like } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import Node from "../../core/Node.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";
import UIElement from "./internal/UIElement.js";

export default class UIRenderer<T extends BoundedRenderer> extends UIElement {
    static create<T extends BoundedRenderer>(constructor: new (...args: ConstructorParameters<typeof BoundedRenderer>) => T): UIRenderer<T> {
        const impl = (new Node(constructor.name)).addComponent(constructor);
        const ui = (new Node).addComponent(UIRenderer);
        ui.node.addChild(impl.node);
        return ui as UIRenderer<T>;
    }

    get impl(): T {
        return this.node.children[0].getComponent(BoundedRenderer) as any;
    }

    private _transformDirty = true;

    private _explicit_size?: Vec2Like;
    public override get size(): Vec2Like {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        const { halfExtentX, halfExtentY } = this.impl.bounds;
        return vec2.create(halfExtentX * 2 * BoundedRenderer.PIXELS_PER_UNIT, halfExtentY * 2 * BoundedRenderer.PIXELS_PER_UNIT);
    }
    public override set size(value: Vec2Like) {
        this._explicit_size = vec2.set(this._explicit_size || vec2.create(), value[0], value[1]);
        this._transformDirty = true;
    }

    private _anchor = vec2.create(0.5, 0.5);
    public get anchor() {
        return this._anchor;
    }
    public set anchor(value) {
        this._anchor = value;
        this._transformDirty = true;
    }

    override getBounds(): Rect {
        return rect.create(-this.size[0] * this._anchor[0], -this.size[1] * this._anchor[1], this.size[0], this.size[1]);
    }

    override start(): void {
        this.impl.on(BoundsEvent.BOUNDS_CHANGED, () => this._transformDirty = true);
    }

    override update(): void {
        if (this._transformDirty) {
            const impl = this.impl;

            if (impl.bounds.halfExtentX && impl.bounds.halfExtentY) {
                const scaleX = this.size[0] / (impl.bounds.halfExtentX * 2);
                const scaleY = this.size[1] / (impl.bounds.halfExtentY * 2);
                impl.node.scale = vec3.create(scaleX, scaleY, 1);
                impl.node.position = vec3.create(
                    -this.size[0] * this.anchor[0] - (impl.bounds.centerX - impl.bounds.halfExtentX) * scaleX,
                    -this.size[1] * this.anchor[1] - (impl.bounds.centerY - impl.bounds.halfExtentY) * scaleY,
                    0);
            }

            this._transformDirty = false;
        }
    }
}