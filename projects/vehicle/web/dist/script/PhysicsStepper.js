import { System } from "engine";
import { World } from "physics";
export class PhysicsStepper extends System {
    constructor(stepTime) {
        super();
        this._steps = [];
        World.instance.stepTime = stepTime;
    }
    step(dt) {
        this._steps.push(dt);
    }
    update() {
        for (const dt of this._steps) {
            World.instance.step(dt);
        }
        this._steps.length = 0;
        World.instance.draw();
    }
}
