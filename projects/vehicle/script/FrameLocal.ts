import { Zero } from "engine";
import { PhysicsSystem } from "physics";
import { Frame } from "./Frame.js";
import { JoystickInputLocal } from "./JoystickInputLocal.js";
import { PhysicsStepper } from "./PhysicsStepper.js";

const stepTime = 1 / 30;

const physicsStepper = new PhysicsStepper(stepTime);
Zero.unregisterSystem(PhysicsSystem.instance);
Zero.registerSystem(physicsStepper, 1);


export class FrameLocal implements Frame {
    readonly input = new JoystickInputLocal

    constructor() {
        Zero.instance.setInterval((dt: number) => {
            this.input.step();
            physicsStepper.step(dt);
        }, stepTime)

        physicsStepper.step(0);
    }
}