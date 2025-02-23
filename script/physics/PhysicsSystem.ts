import { System, Zero } from 'engine';
import { phys } from 'phys';

export class PhysicsSystem extends System {

    static readonly instance = new PhysicsSystem();

    readonly pointer = phys.fn.physWorld_new();

    override update(dt: number): void {
        phys.fn.physWorld_stepSimulation(this.pointer, dt, 1, 1 / 60);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)