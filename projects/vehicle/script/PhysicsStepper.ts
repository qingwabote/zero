import { System } from "engine";
import { World } from "physics";

export class PhysicsStepper extends System {
    private readonly _steps: number[] = [];

    constructor(stepTime: number) {
        super();
        World.instance.stepTime = stepTime;
    }

    step(dt: number) {
        this._steps.push(dt);
    }

    override update(): void {
        for (const dt of this._steps) {
            World.instance.step(dt);
        }
        this._steps.length = 0;

        World.instance.draw();
    }
}