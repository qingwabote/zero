import { Vec3 } from "../math/vec3.js";
import PhysicsSystem from "./PhysicsSystem.js";

export default class PhysicsWorld {
    private _collisionConfiguration;
    private _broadphase;
    private _dispatcher;
    private _solver;

    readonly impl;


    constructor() {
        const ammo = PhysicsSystem.instance.ammo;

        this._collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
        this._dispatcher = new ammo.btCollisionDispatcher(this._collisionConfiguration);
        this._broadphase = new ammo.btDbvtBroadphase();
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this.impl = new ammo.btDiscreteDynamicsWorld(this._dispatcher, this._broadphase, this._solver, this._collisionConfiguration);
    }

    rayTest(from: Vec3, to: Vec3): void {
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        ps.bt_vec3_a.setValue(...from);
        ps.bt_vec3_b.setValue(...to);

        const allHitsRayResultCallback = new ammo.AllHitsRayResultCallback(ps.bt_vec3_a, ps.bt_vec3_b);
        this.impl.rayTest(ps.bt_vec3_a, ps.bt_vec3_b, allHitsRayResultCallback);
        console.log("hasHit", allHitsRayResultCallback.hasHit())

        ammo.destroy(allHitsRayResultCallback);
    }

    stepSimulation() {
        this.impl.debugDrawWorld();
        // this.impl.stepSimulation(1 / 60, 10);
    }
}

