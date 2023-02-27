import vec3 from "../../core/math/vec3.js";
import Node from "../../core/Node.js";
import RectBoundsRenderer from "../internal/RectBoundsRenderer.js";
import UIElement, { DirtyFlag } from "./internal/UIElement.js";

export default class UIRenderer<T extends RectBoundsRenderer> extends UIElement {
    static create<T extends RectBoundsRenderer>(constructor: new (...args: ConstructorParameters<typeof RectBoundsRenderer>) => T): UIRenderer<T> {
        const renderer = (new Node).addComponent(constructor);
        const element = (new Node).addComponent(UIRenderer);
        element.node.addChild(renderer.node);
        return element as UIRenderer<T>;
    }

    get impl(): T {
        return this.node.children[0].getComponent(RectBoundsRenderer) as any;
    }

    override update(): void {
        if (this._dirtyFlags) {
            const impl = this.impl;
            impl.node.visibilityFlag = this.node.visibilityFlag;

            const scaleX = this._size[0] / impl.bounds.width;
            const scaleY = this._size[1] / impl.bounds.height;
            impl.node.scale = vec3.create(scaleX, scaleY, 1);
            impl.node.position = vec3.create(
                -this.size[0] * this.anchor[0] - impl.bounds.x * scaleX,
                -this.size[1] * this.anchor[1] - impl.bounds.y * scaleY,
                0)

            this._dirtyFlags = DirtyFlag.NONE;
        }
    }
}