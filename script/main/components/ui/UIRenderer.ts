import vec2, { Vec2 } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import Node from "../../core/Node.js";
import { PIXELS_PER_UNIT } from "../../core/scene/SubMesh.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";
import UIElement, { UIBoundsEventType } from "./internal/UIElement.js";

const vec3_a = vec3.create();

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

    private _layoutDirty = true;

    private _explicit_size?: Vec2;
    public override get size(): Readonly<Vec2> {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        const halfExtent = this.impl.bounds.halfExtent;
        return vec2.create(halfExtent[0] * 2 * PIXELS_PER_UNIT, halfExtent[1] * 2 * PIXELS_PER_UNIT);
    }
    public override set size(value: Readonly<Vec2>) {
        this._explicit_size = vec2.copy(this._explicit_size || vec2.create(), value);
        this._layoutDirty = true;
    }

    private _anchor: Readonly<Vec2> = vec2.create(0.5, 0.5);
    public get anchor() {
        return this._anchor;
    }
    public set anchor(value: Readonly<Vec2>) {
        vec2.copy(this._anchor, value);
        this._layoutDirty = true;
    }

    override start(): void {
        this.impl.on(BoundsEvent.BOUNDS_CHANGED, () => {
            this.emit(UIBoundsEventType.BOUNDS_CHANGED);
            this._layoutDirty = true;
        });
    }

    override update(): void {
        if (this._layoutDirty) {
            const impl = this.impl;

            if (impl.bounds.halfExtent[0] && impl.bounds.halfExtent[1]) {
                const scaleX = this.size[0] / (impl.bounds.halfExtent[0] * 2);
                const scaleY = this.size[1] / (impl.bounds.halfExtent[1] * 2);
                impl.node.scale = vec3.set(vec3_a, scaleX, scaleY, 1);
                impl.node.position = vec3.set(
                    vec3_a,
                    -this.size[0] * this.anchor[0] - (impl.bounds.center[0] - impl.bounds.halfExtent[0]) * scaleX,
                    -this.size[1] * this.anchor[1] - (impl.bounds.center[1] - impl.bounds.halfExtent[1]) * scaleY,
                    0);
            }

            this._layoutDirty = false;
        }
    }
}