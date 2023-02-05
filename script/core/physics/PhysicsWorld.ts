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

    }
}

