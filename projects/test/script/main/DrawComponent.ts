import Component from "../../../../script/core/Component.js";
import Camera from "../../../../script/core/components/Camera.js";
import Primitive from "../../../../script/core/components/Primitive.js";
import { InputEvent } from "../../../../script/core/Input.js";
import vec2, { Vec2 } from "../../../../script/core/math/vec2.js";
import vec3 from "../../../../script/core/math/vec3.js";

export default class DrawComponent extends Component {
    camera!: Camera;

    override start(): void {
        const primitive = this.node.addComponent(Primitive);

        let last: Vec2;
        zero.input.on(InputEvent.TOUCH_START, event => {
            const touch = event.touches[0];
            const pos = this.camera.screenToWorld(vec2.create(), touch.x, touch.y);
            if (!last) {
                last = pos;
                return;
            }

            primitive.drawLine(vec3.create(last[0], last[1], 0), vec3.create(pos[0], pos[1], 0));
            last = pos;
        })
    }
}