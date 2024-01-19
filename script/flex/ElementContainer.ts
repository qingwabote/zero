import { Element, ElementEventToListener } from "./Element.js";
import * as yoga from "./yoga/index.js";

export class ElementContainer<T extends ElementEventToListener = ElementEventToListener> extends Element<T> {
    public get flexDirection(): yoga.FlexDirection {
        return this.yg_node.deref().getFlexDirection();
    }
    public set flexDirection(value: yoga.FlexDirection) {
        this.yg_node.deref().setFlexDirection(value);
    }

    public get justifyContent(): yoga.Justify {
        return this.yg_node.deref().getJustifyContent();
    }
    public set justifyContent(value: yoga.Justify) {
        this.yg_node.deref().setJustifyContent(value);
    }

    public get alignItems(): yoga.Align {
        return this.yg_node.deref().getAlignItems();
    }
    public set alignItems(value: yoga.Align) {
        this.yg_node.deref().setAlignItems(value);
    }

    addElement(element: Element) {
        this.yg_node.deref().insertChild(element.yg_node.deref(), this.yg_node.deref().getChildCount());
        this.node.addChild(element.node);
    }
}