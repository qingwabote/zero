import { impl, load, World } from 'phys';
import { System } from "../core/System.js";
import { Zero } from "../core/Zero.js";

let ready = false;
load().then(function () {
    ready = true;
})

export class PhysicsSystem implements System {

    static readonly instance = new PhysicsSystem();

    get ready(): boolean {
        return ready;
    }

    private _world?: World = undefined
    get world(): World {
        if (!this._world) {
            this._world = new World;
        }
        return this._world;
    }

    readonly impl = impl;

    load() {
        return load();
    }

    update(dt: number): void {
        this._world?.update(dt);
    }
}
Zero.registerSystem(PhysicsSystem.instance, 1)