import rect, { Rect } from "../../core/math/rect.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import Node from "../../core/Node.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";
import UIElement from "./internal/UIElement.js";

export default class UIRenderer<T extends BoundedRenderer> extends UIElement {
    static create<T extends BoundedRenderer>(constructor: new (...args: ConstructorParameters<typeof BoundedRenderer>) => T): UIRenderer<T> {
        const renderer = (new Node(constructor.name)).addComponent(constructor);
        const element = (new Node).addComponent(UIRenderer);
        element.node.addChild(renderer.node);
        return element as UIRenderer<T>;
    }

    get impl(): T {
        return this.node.children[0].getComponent(BoundedRenderer) as any;
    }

    private _transformDirty = true;

    private _explicit_size?: Vec2;
    public override get size(): Vec2 {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        const { extentX, extentY } = this.impl.bounds;
        return vec2.create(extentX * BoundedRenderer.PIXELS_PER_UNIT, extentY * BoundedRenderer.PIXELS_PER_UNIT);
    }
    public override set size(value: Vec2) {
        if (this._explicit_size) {
            vec2.set(this._explicit_size, ...value);
        } else {
            this._explicit_size = vec2.create(...value);
        }
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

    getAABB(): Rect {
        return rect.create(-this.size[0] * this._anchor[0], -this.size[1] * this._anchor[1], this.size[0], this.size[1]);
    }

    override start(): void {
        this.impl.on(BoundsEvent.BOUNDS_CHANGED, () => this._transformDirty = true);
    }

    override update(): void {
        if (this._transformDirty) {
            const impl = this.impl;

            if (impl.bounds.extentX && impl.bounds.extentY) {
                const scaleX = this.size[0] / impl.bounds.extentX;
                const scaleY = this.size[1] / impl.bounds.extentY;
                impl.node.scale = vec3.create(scaleX, scaleY, 1);
                impl.node.position = vec3.create(
                    -this.size[0] * this.anchor[0] - impl.bounds.originX * scaleX,
                    -this.size[1] * this.anchor[1] - impl.bounds.originY * scaleY,
                    0);
            }

            this._transformDirty = false;
        }
    }
}