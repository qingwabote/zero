import BoundedRenderer from "../../../../script/main/components/internal/BoundedRenderer.js";
import Primitive from "../../../../script/main/components/Primitive.js";
import { UITouchEventType } from "../../../../script/main/components/ui/internal/UIElement.js";
import UIContainer from "../../../../script/main/components/ui/UIContainer.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import vec2, { Vec2 } from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";

const vec3_a = vec3.create()
const vec3_b = vec3.create()
const vec3_c = vec3.create()
const vec3_d = vec3.create()

export default class Joystick extends UIContainer {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }

    constructor(node: Node) {
        super(node);

        const primitive = UIRenderer.create(Primitive);
        this.draw(primitive, this._point)
        this.addElement(primitive);

        this.on(UITouchEventType.TOUCH_START, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0] / BoundedRenderer.PIXELS_PER_UNIT, 1), -1),
                Math.max(Math.min(local[1] / BoundedRenderer.PIXELS_PER_UNIT, 1), -1)
            )
            this.draw(primitive, this._point)
        });
        this.on(UITouchEventType.TOUCH_MOVE, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0] / BoundedRenderer.PIXELS_PER_UNIT, 1), -1),
                Math.max(Math.min(local[1] / BoundedRenderer.PIXELS_PER_UNIT, 1), -1)
            )
            this.draw(primitive, this._point)
        });
        this.on(UITouchEventType.TOUCH_END, event => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point)
        });
    }

    draw(primitive: UIRenderer<Primitive>, point: Vec2): void {
        const impl = primitive.impl;
        impl.clear();

        const halfPoint = 0.2;

        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b)
        impl.drawLine(vec3_b, vec3_c)
        impl.drawLine(vec3_c, vec3_d)
        impl.drawLine(vec3_d, vec3_a)

        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b)
        impl.drawLine(vec3_b, vec3_c)
        impl.drawLine(vec3_c, vec3_d)
        impl.drawLine(vec3_d, vec3_a)
    }
}