import Component from "../../../../script/core/Component.js";
import { InputEvent, Touch } from "../../../../script/core/Input.js";
import quat from "../../../../script/core/math/quat.js";
import vec3 from "../../../../script/core/math/vec3.js";

export default class ZeroComponent extends Component {
    override start(): void {
        let touch: Touch;
        zero.input.on(InputEvent.TOUCH_START, event => {
            touch = event.touches[0];
        })
        zero.input.on(InputEvent.TOUCH_MOVE, event => {
            const dx = event.touches[0].x - touch.x;
            const dy = event.touches[0].y - touch.y;

            const axis = vec3.create(dy, dx, 0);// rotate 90°
            vec3.normalize(axis, axis);
            const rad = -Math.PI / 180 * Math.sqrt(dx * dx + dy * dy);

            // axis world to local
            const rot = quat.create();
            // quat.invert(rot, this._node.rotationWorld);
            // vec3.transformQuat(axis, axis, rot);
            // rotate by axis
            quat.fromAxisAngle(rot, axis, rad);
            quat.multiply(rot, this._node.rotation, rot);

            this._node.rotation = rot;

            touch = event.touches[0];
        })
        zero.input.on(InputEvent.GESTURE_PINCH, event => {
            // const position = Object.assign(vec3.create(), this._node.position);
            // position[2] += delta / 1000;

            // this._node.position = vec3.transformQuat(vec3.create(), position, this._node.rotation);

            let delta_position = vec3.create(0, 0, event.delta / 1000);
            delta_position = vec3.transformQuat(vec3.create(), delta_position, this._node.rotation);
            this._node.position = vec3.add(vec3.create(), this._node.position, delta_position);
        })
    }

    override update(): void {
        // this._node.eulerX += 0.2
        // this._node.eulerY += 0.2
        // this._node.eulerZ += 0.2
    }
}