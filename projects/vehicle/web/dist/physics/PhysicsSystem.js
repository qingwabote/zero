import { System, Zero } from 'engine';
import { phys } from 'phys';
export class PhysicsSystem extends System {
    constructor() {
        super(...arguments);
        this.pointer = phys.fn.physWorld_new();
    }
    update(dt) {
        phys.fn.physWorld_stepSimulation(this.pointer, dt, 1, 1 / 60);
    }
}
PhysicsSystem.instance = new PhysicsSystem();
Zero.registerSystem(PhysicsSystem.instance, 1);
