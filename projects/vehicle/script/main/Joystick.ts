import Primitive from "../../../../script/main/components/Primitive.js";
import { UITouchEventType } from "../../../../script/main/components/ui/internal/UIElement.js";
import UIContainer from "../../../../script/main/components/ui/UIContainer.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import Node from "../../../../script/main/core/Node.js";

export default class Joystick extends UIContainer {
    private _primitive: UIRenderer<Primitive>;

    constructor(node: Node) {
        super(node);

        const primitive = UIRenderer.create(Primitive);
        this.addElement(primitive);
        this._primitive = primitive;

        this.on(UITouchEventType.TOUCH_MOVE, event => {
            console.log("event.touch", event.touch.local)
        })
    }

    update(): void {
        this._primitive.impl.clear();
        this._primitive.impl.drawLine([-1, 1, 0], [-1, -1, 0])
        this._primitive.impl.drawLine([-1, -1, 0], [1, -1, 0])
        this._primitive.impl.drawLine([1, -1, 0], [1, 1, 0])
        this._primitive.impl.drawLine([1, 1, 0], [-1, 1, 0])
    }
}