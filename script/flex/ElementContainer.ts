import { pk } from "puttyknife";
import { Element } from "./Element.js";
import { Align, FlexDirection, Justify } from "./enums.js";

export class ElementContainer<T extends Element.EventToListener = Element.EventToListener> extends Element<T> {
    public get flexDirection(): FlexDirection {
        return pk.fn.YGNodeStyleGetFlexDirection(this.yg_node)
    }
    public set flexDirection(value: FlexDirection) {
        pk.fn.YGNodeStyleSetFlexDirection(this.yg_node, value)
    }

    public get justifyContent(): Justify {
        return pk.fn.YGNodeStyleGetJustifyContent(this.yg_node);
    }
    public set justifyContent(value: Justify) {
        pk.fn.YGNodeStyleSetJustifyContent(this.yg_node, value);
    }

    public get alignItems(): Align {
        return pk.fn.YGNodeStyleGetAlignItems(this.yg_node);
    }
    public set alignItems(value: Align) {
        pk.fn.YGNodeStyleSetAlignItems(this.yg_node, value)
    }

    addElement(element: Element) {
        pk.fn.YGNodeInsertChild(this.yg_node, element.yg_node, pk.fn.YGNodeGetChildCount(this.yg_node))
        this.node.addChild(element.node);
    }
}