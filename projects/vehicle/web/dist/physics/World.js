import { phys } from "phys";
export class World {
    constructor() {
        this.stepTime = 1 / 60;
        this.pointer = phys.fn.physWorld_new();
        this._bodies = new Set;
    }
    addRigidBody(body) {
        phys.fn.physWorld_addRigidBody(this.pointer, body.pointer);
        this._bodies.add(body);
    }
    ping() {
        for (const body of this._bodies) {
            body.ping();
        }
    }
    step(dt) {
        phys.fn.physWorld_stepSimulation(this.pointer, dt, 1, this.stepTime);
    }
    pong() {
        for (const body of this._bodies) {
            body.pong();
        }
    }
    draw() {
        phys.fn.physWorld_drawDebug(this.pointer);
    }
}
World.instance = new World();
