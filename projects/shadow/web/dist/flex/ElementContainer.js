import { Element } from "./Element.js";
export class ElementContainer extends Element {
    get flexDirection() {
        return this.yg_node.deref().getFlexDirection();
    }
    set flexDirection(value) {
        this.yg_node.deref().setFlexDirection(value);
    }
    get justifyContent() {
        return this.yg_node.deref().getJustifyContent();
    }
    set justifyContent(value) {
        this.yg_node.deref().setJustifyContent(value);
    }
    get alignItems() {
        return this.yg_node.deref().getAlignItems();
    }
    set alignItems(value) {
        this.yg_node.deref().setAlignItems(value);
    }
    addElement(element) {
        this.yg_node.deref().insertChild(element.yg_node.deref(), this.yg_node.deref().getChildCount());
        this.node.addChild(element.node);
    }
}
