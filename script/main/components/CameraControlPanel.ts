import Component from "../core/Component.js";
import { InputEvent, Touch } from "../core/Input.js";
import quat from "../core/math/quat.js";
import vec3 from "../core/math/vec3.js";
import TextRenderer from "./2d/TextRenderer.js";
import Camera from "./Camera.js";

export default class CameraControlPanel extends Component {
    camera!: Camera;

    private _dirty = true;

    private _fixed: boolean = true;
    private get fixed(): boolean {
        return this._fixed;
    }
    private set fixed(value: boolean) {
        this._fixed = value;
        this._dirty = true;
    }

    override start(): void {
        this.node.addComponent(TextRenderer);

        zero.input.on(InputEvent.TOUCH_START, event => {
            // const camera = zero.scene.cameras.find(camera => camera.visibilities & this.node.visibility)!;
            // const touch = event.touches[0];
        })


        let touch: Touch;
        zero.input.on(InputEvent.TOUCH_START, event => {
            touch = event.touches[0];
        })
        zero.input.on(InputEvent.TOUCH_MOVE, event => {
            const dx = event.touches[0].x - touch.x;
            const dy = event.touches[0].y - touch.y;

            if (this.fixed) {
                const rotation = quat.fromEuler(quat.create(), dy, dx, 0);
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

            touch = event.touches[0];
        })
        zero.input.on(InputEvent.GESTURE_PINCH, event => {
            let delta_position = vec3.create(0, 0, event.delta / 1000);
            delta_position = vec3.transformQuat(vec3.create(), delta_position, this.camera.node.rotation);
            this.camera.node.position = vec3.add(vec3.create(), this.camera.node.position, delta_position);
        })
    }

    override update(): void {
        if (this._dirty) {
            const label = this.node.getComponent(TextRenderer)!;
            label.text = this.fixed ? "Fixed Camera" : "Wandering Camera";

            const view = vec3.normalize(vec3.create(), this.camera.node.position);
            if (this.fixed) {
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            } else {
                view[1] = 0;
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            }

            this._dirty = false;
        }

    }
}