import { System, Zero } from 'engine';
import { World } from './World.js';

export class PhysicsSystem extends System {

    static readonly instance = new PhysicsSystem();

    private constructor() {
        super();
    }

    override update(dt: number): void {
        World.instance.step(dt);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)