import vec3, { Vec3 } from "../math/vec3.js";
import PhysicsSystem from "./PhysicsSystem.js";
import RayResultCallback from "./RayResultCallback.js";

export default class PhysicsWorld {
    private _collisionConfiguration;
    private _broadphase;
    private _dispatcher;
    private _solver;

    readonly impl;

    private _rayTestFromTo: Readonly<Vec3>[] = [vec3.ZERO, vec3.ZERO];

    constructor(context: PhysicsSystem) {
        const ammo = context.ammo;

        this._collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
        this._dispatcher = new ammo.btCollisionDispatcher(this._collisionConfiguration);
        this._broadphase = new ammo.btDbvtBroadphase();
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this.impl = new ammo.btDiscreteDynamicsWorld(this._dispatcher, this._broadphase, this._solver, this._collisionConfiguration);
    }

    rayTest(from: Vec3, to: Vec3, resultCallback: RayResultCallback): void {
        const ps = PhysicsSystem.instance;

        ps.bt_vec3_a.setValue(...from);
        ps.bt_vec3_b.setValue(...to);

        this.impl.rayTest(ps.bt_vec3_a, ps.bt_vec3_b, resultCallback.impl);

        this._rayTestFromTo = [from, to];
    }

    stepSimulation() {
        this.impl.stepSimulation(1 / 60);

        const drawer = this.impl.getDebugDrawer();
        if (drawer) {
            const ps = PhysicsSystem.instance;

            ps.bt_vec3_a.setValue(...this._rayTestFromTo[0]);
            ps.bt_vec3_b.setValue(...this._rayTestFromTo[1]);
            drawer.drawLine(ps.bt_vec3_a, ps.bt_vec3_b);

            this.impl.debugDrawWorld();
        }
    }
}
