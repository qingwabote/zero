import rect from "../../core/math/rect.js";
import vec2, { Vec2Like } from "../../core/math/vec2.js";
import UIElement, { UIEventToListener } from "./internal/UIElement.js";

export default class UIContainer<EventToListener extends UIEventToListener = UIEventToListener> extends UIElement<EventToListener> {
    private _explicit_size?: Vec2Like;
    public get size(): Vec2Like {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        const bounds = rect.create();
        for (const child of this.node.children) {
            const element = child.getComponent(UIElement);
            if (!element) {
                continue;
            }
            rect.union(bounds, bounds, element.getBoundsToParent());
        }
        return vec2.create(bounds.width, bounds.height);
    }
    public set size(value: Vec2Like) {
        this._explicit_size = vec2.set(this._explicit_size || vec2.create(), value[0], value[1])
    }

    addElement(element: UIElement) {
        this.node.addChild(element.node);
    }
}