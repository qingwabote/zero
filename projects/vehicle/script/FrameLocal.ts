import { vec2, Zero } from "engine";
import { PhysicsSystem } from "physics";
import { Frame } from "./Frame.js";
import { JoystickInput } from "./JoystickInput.js";
import { PhysicsStepper } from "./PhysicsStepper.js";

const stepTime = 1 / 30;

const physicsStepper = new PhysicsStepper(stepTime);
Zero.unregisterSystem(PhysicsSystem.instance);
Zero.registerSystem(physicsStepper, 1);


export class FrameLocal extends Frame {
    readonly input = new JoystickInput;

    start(): void {
        let dirty = false;
        this.input.on(JoystickInput.Events.DIRTY, () => {
            dirty = true;
        })

        Zero.instance.setInterval((dt: number) => {
            let data: Frame.Data = { delta: dt };
            if (dirty) {
                data.input = vec2.copy(vec2.create(), this.input.point);
            }
            this.push(data);
        }, stepTime)

        physicsStepper.step(0);
    }
}