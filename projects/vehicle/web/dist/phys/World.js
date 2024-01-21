import { impl as ammo } from "./context.js";
export class World {
    get debugDrawer() {
        return this._debugDrawer;
    }
    set debugDrawer(value) {
        this.impl.setDebugDrawer(value ? value.impl : ammo.NULL);
        this._debugDrawer = value;
    }
    constructor() {
        this._debugDrawer = undefined;
        this._collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
        this._dispatcher = new ammo.btCollisionDispatcher(this._collisionConfiguration);
        this._broadphase = new ammo.btDbvtBroadphase();
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this.impl = new ammo.btDiscreteDynamicsWorld(this._dispatcher, this._broadphase, this._solver, this._collisionConfiguration);
    }
    addRigidBody(body) {
        this.impl.addRigidBody(body.impl);
    }
    rayTest(from, to, resultCallback) {
        this.impl.rayTest(from.impl, to.impl, resultCallback.impl);
    }
    update(dt) {
        this.impl.stepSimulation(1 / 60);
        const drawer = this.impl.getDebugDrawer();
        if (!ammo.compare(drawer, ammo.NULL)) {
            this.impl.debugDrawWorld();
        }
    }
}
