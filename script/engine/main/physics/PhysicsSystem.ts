import { System } from "../core/System.js";
// import { Zero } from "../core/Zero.js";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { ammo } from "./internal/ammo.js";

export class PhysicsSystem implements System {

    static readonly instance = new PhysicsSystem();

    get ready(): boolean {
        return ammo.loaded;
    }

    private _world?: PhysicsWorld = undefined
    get world(): PhysicsWorld {
        if (!this._world) {
            this._world = new PhysicsWorld;
        }
        return this._world;
    }

    update(dt: number): void {
        this._world?.update(dt);
    }
}
// Zero.registerSystem(PhysicsSystem.instance, 1)