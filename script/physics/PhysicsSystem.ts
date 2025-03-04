import { System, Zero } from 'engine';
import { World } from './World.js';

export class PhysicsSystem extends System {

    static readonly instance = new PhysicsSystem();

    readonly world = new World;

    override update(dt: number): void {
        this.world.step(dt);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)