import { pk } from "puttyknife";
import { RigidBody } from "./RigidBody.js";

export class World {
    static readonly instance = new World();

    stepTime = 1 / 60;

    readonly pointer = pk.fn.physWorld_new();

    private readonly _bodies: Set<RigidBody> = new Set;

    private constructor() { }

    public addRigidBody(body: RigidBody): void {
        pk.fn.physWorld_addRigidBody(this.pointer, body.pointer);
        this._bodies.add(body);
    }

    public ping() {
        for (const body of this._bodies) {
            body.ping();
        }
    }

    public step(dt: number) {
        pk.fn.physWorld_stepSimulation(this.pointer, dt, 1, this.stepTime);
    }

    public pong() {
        for (const body of this._bodies) {
            body.pong();
        }
    }

    public draw() {
        pk.fn.physWorld_drawDebug(this.pointer);
    }
}