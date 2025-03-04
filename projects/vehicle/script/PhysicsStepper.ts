import { System } from "engine";
import { PhysicsSystem } from "physics";

export class PhysicsStepper extends System {
    private readonly _steps: number[] = [];

    constructor(stepTime: number) {
        super();
        PhysicsSystem.instance.world.stepTime = stepTime;
    }

    step(dt: number) {
        this._steps.push(dt);
    }

    override update(): void {
        for (const dt of this._steps) {
            PhysicsSystem.instance.update(dt);
        }
        this._steps.length = 0;
    }
}