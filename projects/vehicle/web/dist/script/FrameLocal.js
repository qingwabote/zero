import { vec2, Zero } from "engine";
import { Frame } from "./Frame.js";
import { JoystickInput } from "./JoystickInput.js";
export class FrameLocal extends Frame {
    constructor() {
        super(...arguments);
        this.input = new JoystickInput;
    }
    start() {
        let dirty = false;
        this.input.on(JoystickInput.Events.DIRTY, () => {
            dirty = true;
        });
        Zero.instance.setInterval((dt) => {
            let data = { delta: dt };
            if (dirty) {
                data.input = vec2.copy(vec2.create(), this.input.point);
            }
            this.push(data);
        }, this.stepTime);
    }
}
