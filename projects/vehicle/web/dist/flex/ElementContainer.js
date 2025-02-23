import { yoga } from "yoga";
import { Element } from "./Element.js";
export class ElementContainer extends Element {
    get flexDirection() {
        return yoga.fn.YGNodeStyleGetFlexDirection(this.yg_node);
    }
    set flexDirection(value) {
        yoga.fn.YGNodeStyleSetFlexDirection(this.yg_node, value);
    }
    get justifyContent() {
        return yoga.fn.YGNodeStyleGetJustifyContent(this.yg_node);
    }
    set justifyContent(value) {
        yoga.fn.YGNodeStyleSetJustifyContent(this.yg_node, value);
    }
    get alignItems() {
        return yoga.fn.YGNodeStyleGetAlignItems(this.yg_node);
    }
    set alignItems(value) {
        yoga.fn.YGNodeStyleSetAlignItems(this.yg_node, value);
    }
    addElement(element) {
        yoga.fn.YGNodeInsertChild(this.yg_node, element.yg_node, yoga.fn.YGNodeGetChildCount(this.yg_node));
        this.node.addChild(element.node);
    }
}
