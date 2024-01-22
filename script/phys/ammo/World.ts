import { DebugDrawer } from "./DebugDrawer.js";
import { RayResultCallback } from "./RayResultCallback.js";
import { RigidBody } from "./RigidBody.js";
import { Vec3 } from "./Vec3.js";
import { impl as ammo } from "./context.js";

export class World {
    private _collisionConfiguration;
    private _broadphase;
    private _dispatcher;
    private _solver;

    readonly impl: any;

    private _debugDrawer: DebugDrawer | undefined = undefined;
    get debugDrawer(): DebugDrawer | undefined {
        return this._debugDrawer;
    }
    set debugDrawer(value: DebugDrawer | undefined) {
        this.impl.setDebugDrawer(value ? value.impl : ammo.NULL);
        this._debugDrawer = value;
    }

    constructor() {
        this._collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
        this._dispatcher = new ammo.btCollisionDispatcher(this._collisionConfiguration);
        this._broadphase = new ammo.btDbvtBroadphase();
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this.impl = new ammo.btDiscreteDynamicsWorld(this._dispatcher, this._broadphase, this._solver, this._collisionConfiguration);
    }

    addRigidBody(body: RigidBody) {
        this.impl.addRigidBody(body.impl)
    }

    rayTest(from: Vec3, to: Vec3, resultCallback: RayResultCallback): void {
        this.impl.rayTest(from.impl, to.impl, resultCallback.impl);
    }

    update(dt: number): void {
        this.impl.stepSimulation(1 / 60);
        const drawer = this.impl.getDebugDrawer();
        if (!ammo.compare(drawer, ammo.NULL)) {
            this.impl.debugDrawWorld();
        }
    }
}