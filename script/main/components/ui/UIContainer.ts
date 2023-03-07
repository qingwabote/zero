import rect, { Rect } from "../../core/math/rect.js";
import UIElement from "./internal/UIElement.js";

export default class UIContainer extends UIElement {
    override getAABB(): Rect {
        const aabb = rect.create();

        for (const child of this.node.children) {
            const element = child.getComponent(UIElement);
            if (!element) {
                continue;
            }
            rect.union(aabb, aabb, element.getAABB());
        }

        return aabb;
    }

    addElement(element: UIElement) {
        this.node.addChild(element.node);
    }
}