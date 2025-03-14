import { System, Zero } from 'engine';
import { World } from './World.js';
export class PhysicsSystem extends System {
    constructor() {
        super();
    }
    update(dt) {
        World.instance.ping();
        World.instance.step(dt);
        World.instance.pong();
    }
}
PhysicsSystem.instance = new PhysicsSystem();
Zero.registerSystem(PhysicsSystem.instance, 1);
