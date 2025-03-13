import { phys } from "phys";
import { RigidBody } from "./RigidBody.js";

export class World {
    static readonly instance = new World();

    stepTime = 1 / 60;

    readonly pointer = phys.fn.physWorld_new();

    private readonly _bodies: Set<RigidBody> = new Set;

    private constructor() { }

    public addRigidBody(body: RigidBody): void {
        phys.fn.physWorld_addRigidBody(this.pointer, body.pointer);
        this._bodies.add(body);
    }

    public step(dt: number) {
        for (const body of this._bodies) {
            body.ping();
        }
        phys.fn.physWorld_stepSimulation(this.pointer, dt, 1, this.stepTime);
        for (const body of this._bodies) {
            body.pong();
        }
    }

    public draw() {
        phys.fn.physWorld_drawDebug(this.pointer);
    }
}