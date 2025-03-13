import { vec2, Zero } from "engine";
import { Frame } from "./Frame.js";
import { JoystickInput } from "./JoystickInput.js";

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
        }, this.stepTime)

        this.push({ delta: 0 })
    }
}