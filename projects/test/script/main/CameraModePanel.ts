import Component from "../../../../script/main/Component.js";
import Camera from "../../../../script/main/components/Camera.js";
import Label from "../../../../script/main/components/Label.js";
import BoxShape from "../../../../script/main/components/physics/BoxShape.js";
import { InputEvent, Touch } from "../../../../script/main/Input.js";
import quat from "../../../../script/main/math/quat.js";
import vec3 from "../../../../script/main/math/vec3.js";
import ClosestRayResultCallback from "../../../../script/main/physics/ClosestRayResultCallback.js";
import PhysicsSystem from "../../../../script/main/physics/PhysicsSystem.js";

export default class CameraModePanel extends Component {
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
        this.node.addComponent(Label);
        this.node.addComponent(BoxShape);

        zero.input.on(InputEvent.TOUCH_START, event => {
            const camera = zero.scene.cameras.find(camera => camera.visibilities & this.node.visibility)!;

            const touch = event.touches[0];
            const from = vec3.create();
            const to = vec3.create();
            camera.screenPointToRay(from, to, touch.x, touch.y);

            const ps = PhysicsSystem.instance;
            const closestRayResultCallback = new ClosestRayResultCallback(ps);
            ps.world.rayTest(from, to, closestRayResultCallback);
            if (closestRayResultCallback.hasHit()) {
                this.fixed = !this.fixed;
            }
        })


        let touch: Touch;
        zero.input.on(InputEvent.TOUCH_START, event => {
            touch = event.touches[0];
        })
        zero.input.on(InputEvent.TOUCH_MOVE, event => {
            const dx = event.touches[0].x - touch.x;
            const dy = event.touches[0].y - touch.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                const rad = -Math.PI / 180 * dx;
                if (this.fixed) {
                    const rotation = quat.fromAxisAngle(quat.create(), vec3.UP, rad);
                    this.camera.node.position = vec3.transformQuat(vec3.create(), this.camera.node.position, rotation);
                    this.camera.node.rotation = quat.multiply(quat.create(), this.camera.node.rotation, rotation);
                } else {
                    const axis = vec3.UNIT_Y;
                    const rot = quat.create();
                    quat.fromAxisAngle(rot, axis, rad);
                    quat.multiply(rot, this.camera.node.rotation, rot);
                    this.camera.node.rotation = rot;
                }
            } else {
                let delta_position = vec3.create(0, dy / 100, 0);
                this.camera.node.position = vec3.add(vec3.create(), this.camera.node.position, delta_position);
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
            const label = this.node.getComponent(Label)!;
            label.text = this.fixed ? "Fixed Camera" : "Wandering Camera";

            const boxShape = this.node.getComponent(BoxShape)!;
            boxShape.size = vec3.create(label.size[0], label.size[1], 100);
            boxShape.origin = vec3.create(label.size[0] / 2, -label.size[1] / 2, 0);

            if (this.fixed) {
                this.camera.node.position = vec3.create(this.camera.node.position[0], 0, this.camera.node.position[2]);
                const to = vec3.negate(vec3.create(), this.camera.node.position);
                const rot = quat.rotationTo(quat.create(), vec3.FORWARD, vec3.normalize(vec3.create(), to))
                this.camera.node.rotation = rot;
            }

            this._dirty = false;
        }

    }
}