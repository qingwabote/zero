import { impl, World } from 'phys';
import { System } from "../core/System.js";
import { Zero } from "../core/Zero.js";

export class PhysicsSystem implements System {

    static readonly instance = new PhysicsSystem();

    private _world?: World = undefined
    get world(): World {
        if (!this._world) {
            this._world = new World;
        }
        return this._world;
    }

    readonly impl = impl;

    update(dt: number): void {
        this._world?.update(dt);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)