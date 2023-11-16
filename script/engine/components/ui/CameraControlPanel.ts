import { InputEventType } from "../../core/Input.js";
import { Zero } from "../../core/Zero.js";
import { quat } from "../../core/math/quat.js";
import { Vec2 } from "../../core/math/vec2.js";
import { vec3 } from "../../core/math/vec3.js";
import { Camera } from "../Camera.js";
import { UIContainer } from "./UIContainer.js";
import { UITouchEventType } from "./UIElement.js";

export class CameraControlPanel extends UIContainer {
    camera!: Camera;

    private _fiexd_changed: boolean = true;
    private _fixed: boolean = true;
    private get fixed(): boolean {
        return this._fixed;
    }
    private set fixed(value: boolean) {
        this._fixed = value;
        this._fiexd_changed = true;
    }

    override start(): void {
        let point: Readonly<Vec2>;
        this.on(UITouchEventType.TOUCH_START, event => {
            point = event.touch.local
        })
        this.on(UITouchEventType.TOUCH_MOVE, event => {
            const dx = event.touch.local[0] - point[0];
            const dy = event.touch.local[1] - point[1];

            if (this.fixed) {
                const rotation = quat.fromEuler(quat.create(), -dy, dx, 0);
                this.camera.node.position = vec3.transformQuat(vec3.create(), this.camera.node.position, rotation);

                const view = vec3.normalize(vec3.create(), this.camera.node.position);
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            } else {
                if (Math.abs(dx) > Math.abs(dy)) {
                    const rad = -Math.PI / 180 * dx;
                    const rot = quat.create();
                    quat.fromAxisAngle(rot, vec3.UNIT_Y, rad);
                    quat.multiply(rot, this.camera.node.rotation, rot);
                    this.camera.node.rotation = rot;
                } else {
                    let delta_position = vec3.create(0, dy / 100, 0);
                    this.camera.node.position = vec3.add(vec3.create(), this.camera.node.position, delta_position);
                }
            }

            point = event.touch.local
        })
        Zero.instance.input.on(InputEventType.GESTURE_PINCH, event => {
            let delta_position = vec3.create(0, 0, event.delta / 1000);
            delta_position = vec3.transformQuat(vec3.create(), delta_position, this.camera.node.rotation);
            this.camera.node.position = vec3.add(vec3.create(), this.camera.node.position, delta_position);
        })
    }

    override update(dt: number): void {
        super.update(dt);
        if (this._fiexd_changed) {
            const view = vec3.normalize(vec3.create(), this.camera.node.position);
            if (this._fixed) {
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            } else {
                view[1] = 0;
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            }
            this._fiexd_changed = false;
        }
    }
}