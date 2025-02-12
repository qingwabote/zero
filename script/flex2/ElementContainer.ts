import { yoga } from "yoga";
import { Element } from "./Element.js";
import { Align, FlexDirection, Justify } from "./enums.js";

export class ElementContainer<T extends Element.EventToListener = Element.EventToListener> extends Element<T> {
    public get flexDirection(): FlexDirection {
        return yoga.fn.YGNodeStyleGetFlexDirection(this.yg_node)
    }
    public set flexDirection(value: FlexDirection) {
        yoga.fn.YGNodeStyleSetFlexDirection(this.yg_node, value)
    }

    public get justifyContent(): Justify {
        return yoga.fn.YGNodeStyleGetJustifyContent(this.yg_node);
    }
    public set justifyContent(value: Justify) {
        yoga.fn.YGNodeStyleSetJustifyContent(this.yg_node, value);
    }

    public get alignItems(): Align {
        return yoga.fn.YGNodeStyleGetAlignItems(this.yg_node);
    }
    public set alignItems(value: Align) {
        yoga.fn.YGNodeStyleSetAlignItems(this.yg_node, value)
    }

    addElement(element: Element) {
        yoga.fn.YGNodeInsertChild(this.yg_node, element.yg_node, yoga.fn.YGNodeGetChildCount(this.yg_node))
        this.node.addChild(element.node);
    }
}