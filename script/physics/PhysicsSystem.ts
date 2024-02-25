import { System, Zero } from 'engine';
import { World, impl } from 'phys';

export class PhysicsSystem extends System {

    static readonly instance = new PhysicsSystem();

    private _world?: World = undefined
    get world(): World {
        if (!this._world) {
            this._world = new World;
        }
        return this._world;
    }

    readonly impl = impl;

    override update(dt: number): void {
        this._world?.update(dt);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)