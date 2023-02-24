import Primitive from "../../../../script/main/components/Primitive.js";
import Component from "../../../../script/main/core/Component.js";
import { InputEvent } from "../../../../script/main/core/Input.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";

export default class DrawComponent extends Component {
    override start(): void {
        const primitive = this.node.addComponent(Primitive);

        // const camera = zero.scene.cameras.find(camera => camera.visibilities & this.node.visibility)!;

        let last: Vec3;
        zero.input.on(InputEvent.TOUCH_START, event => {
            const touch = event.touches[0];
            const from = vec3.create();
            const to = vec3.create();
            // camera.screenPointToRay(from, to, touch.x, touch.y);
            if (!last) {
                last = from;
                return;
            }

            primitive.drawLine(vec3.create(last[0], last[1], 0), vec3.create(from[0], from[1], 0));

            // primitive.drawLine(from, to);

            last = from;
        })
    }
}