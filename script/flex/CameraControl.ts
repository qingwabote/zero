import { Camera, Component, Input, Vec2, quat, vec3 } from "engine";
import { Element } from "./Element.js";

const vec3_a = vec3.create()
const quat_a = quat.create()

export class CameraControl extends Component {
    camera!: Camera;

    private _panel: Element | null = null;
    public get panel(): Element {
        return this._panel || this.node.getComponent(Element)!;
    }
    public set panel(value: Element) {
        this._panel = value;
    }

    private _fixed_changed: boolean = true;
    private _fixed: boolean = true;
    private get fixed(): boolean {
        return this._fixed;
    }
    private set fixed(value: boolean) {
        this._fixed = value;
        this._fixed_changed = true;
    }

    override start(): void {
        let point: Readonly<Vec2> | null = null;
        this.panel.emitter.on(Input.TouchEvents.START, event => {
            point = event.touch.local
        })
        this.panel.emitter.on(Input.TouchEvents.MOVE, event => {
            if (point) {
                const dx = event.touch.local[0] - point[0];
                const dy = event.touch.local[1] - point[1];

                if (this.fixed) {
                    const rotation = quat.fromEuler(quat_a, -dy, dx, 0);
                    this.camera.node.position = vec3.transformQuat(vec3_a, this.camera.node.position, rotation);

                    this.camera.node.lookAt(vec3.ZERO);
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
            }
            point = event.touch.local
        })
        this.panel.emitter.on(Input.TouchEvents.END, () => {
            point = null;
        })

        this.panel.emitter.on(Input.GestureEvents.PINCH, event => {
            if (this.camera.fov != -1) {
                vec3.set(vec3_a, 0, 0, -event.delta / 100);
                vec3.transformQuat(vec3_a, vec3_a, this.camera.node.rotation);
                this.camera.node.position = vec3.add(vec3_a, vec3_a, this.camera.node.position);
            } else {
                this.camera.orthoSize += -event.delta / 100;
            }
        })
    }

    override update(dt: number): void {
        super.update(dt);
        if (this._fixed_changed) {
            const view = vec3.normalize(vec3.create(), this.camera.node.position);
            if (this._fixed) {
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            } else {
                view[1] = 0;
                this.camera.node.rotation = quat.fromViewUp(quat.create(), view);
            }
            this._fixed_changed = false;
        }
    }
}