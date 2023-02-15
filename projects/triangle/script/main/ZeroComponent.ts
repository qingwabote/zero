import Component from "../../../../script/main/base/Component.js";
import Input, { Touch } from "../../../../script/main/Input.js";
import quat from "../../../../script/main/math/quat.js";
import vec3 from "../../../../script/main/math/vec3.js";

export default class ZeroComponent extends Component {
    override start(): void {
        // const scale = Object.assign(vec3.create(), this._node.scale);
        // scale[0] *= 0.8;
        // scale[1] *= 0.8;
        // scale[2] *= 0.8;
        // this._node.scale = scale;
        this._node.position = [0, 0, -10]
        // this._node.eulerX = 45;
        // this._node.eulerY = 45;
        // this._node.eulerZ = 45;

        let touch: Touch;
        zero.input.on(Input.Event.TOUCH_START, event => {
            touch = event.touches[0];
        })
        zero.input.on(Input.Event.TOUCH_MOVE, event => {
            const dx = event.touches[0].x - touch.x;
            const dy = event.touches[0].y - touch.y;

            const axis = vec3.create(dy, dx, 0);// rotate 90°
            vec3.normalize(axis, axis);
            const rad = Math.PI / 180 * Math.sqrt(dx * dx + dy * dy);

            // get inv-axis (local to rot)
            const rot = quat.create();
            quat.invert(rot, this._node.rotation);
            vec3.transformQuat(axis, axis, rot);
            // rotate by inv-axis
            quat.fromAxisAngle(rot, axis, rad);
            quat.multiply(rot, this._node.rotation, rot);

            this._node.rotation = rot;

            touch = event.touches[0];
        })
    }

    override update(dt: number): void {
        // this._node.eulerX += 0.2
        // this._node.eulerY += 0.2
        // this._node.eulerZ += 0.2
    }
}