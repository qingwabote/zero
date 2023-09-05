import { Vec3, vec3 } from "../core/math/vec3.js";
import { RayResultCallback } from "./RayResultCallback.js";
import { ammo } from "./internal/ammo.js";

let bt_vec3_a: any;
let bt_vec3_b: any;
ammo.loading.then(function () {
    bt_vec3_a = new ammo.btVector3(0, 0, 0);
    bt_vec3_b = new ammo.btVector3(0, 0, 0);
})

export class PhysicsWorld {

    private _collisionConfiguration;
    private _broadphase;
    private _dispatcher;
    private _solver;

    readonly impl;

    private _rayTestFromTo: Readonly<Vec3>[] = [vec3.ZERO, vec3.ZERO];

    constructor() {
        this._collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
        this._dispatcher = new ammo.btCollisionDispatcher(this._collisionConfiguration);
        this._broadphase = new ammo.btDbvtBroadphase();
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this.impl = new ammo.btDiscreteDynamicsWorld(this._dispatcher, this._broadphase, this._solver, this._collisionConfiguration);
    }

    rayTest(from: Vec3, to: Vec3, resultCallback: RayResultCallback): void {
        bt_vec3_a.setValue(...from);
        bt_vec3_b.setValue(...to);

        this.impl.rayTest(bt_vec3_a, bt_vec3_b, resultCallback.impl);

        this._rayTestFromTo = [from, to];
    }

    update(dt: number): void {
        this.impl.stepSimulation(1 / 60);

        const drawer = this.impl.getDebugDrawer();
        if (!ammo.compare(drawer, ammo.NULL)) {

            bt_vec3_a.setValue(...this._rayTestFromTo[0]);
            bt_vec3_b.setValue(...this._rayTestFromTo[1]);
            drawer.drawLine(bt_vec3_a, bt_vec3_b);

            this.impl.debugDrawWorld();
        }
    }
}
