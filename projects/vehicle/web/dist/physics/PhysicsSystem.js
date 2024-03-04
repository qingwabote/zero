import { System, Zero } from 'engine';
import { World, impl } from 'phys';
export class PhysicsSystem extends System {
    constructor() {
        super(...arguments);
        this._world = undefined;
        this.impl = impl;
    }
    get world() {
        if (!this._world) {
            this._world = new World;
        }
        return this._world;
    }
    update(dt) {
        var _a;
        (_a = this._world) === null || _a === void 0 ? void 0 : _a.update(dt);
    }
}
PhysicsSystem.instance = new PhysicsSystem();
Zero.registerSystem(PhysicsSystem.instance, 1);
