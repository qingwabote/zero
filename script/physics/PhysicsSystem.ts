import { System, Zero } from 'engine';
import { phys } from 'phys';
import { RigidBody } from './RigidBody.js';

export class PhysicsSystem extends System {

    static readonly instance = new PhysicsSystem();

    private readonly _bodies: Set<RigidBody> = new Set;

    readonly pointer = phys.fn.physWorld_new();

    public addRigidBody(body: RigidBody): void {
        phys.fn.physWorld_addRigidBody(this.pointer, body.pointer);
        this._bodies.add(body);
    }

    override update(dt: number): void {
        for (const body of this._bodies) {
            body.ping();
        }
        phys.fn.physWorld_stepSimulation(this.pointer, dt, 1, 1 / 60);
        for (const body of this._bodies) {
            body.pong();
        }
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)