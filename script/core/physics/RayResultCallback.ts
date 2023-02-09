import PhysicsSystem from "./PhysicsSystem.js";

export default abstract class RayResultCallback {
    protected _context: PhysicsSystem;

    readonly impl: any;

    // public get rayFromWorld(): Vec3 {
    //     const bt_vec3 = this.impl.get_m_rayFromWorld();
    //     return vec3.create(bt_vec3.x(), bt_vec3.y(), bt_vec3.z());
    // }
    // public set rayFromWorld(value: Vec3) {
    //     this._context.bt_vec3_a.setValue(...value);
    //     this.impl.set_m_rayFromWorld(this._context.bt_vec3_a);
    // }

    // public get rayToWorld(): Vec3 {
    //     const bt_vec3 = this.impl.get_m_rayToWorld();
    //     return vec3.create(bt_vec3.x(), bt_vec3.y(), bt_vec3.z());
    // }
    // public set rayToWorld(value: Vec3) {
    //     this._context.bt_vec3_a.setValue(...value);
    //     this.impl.set_m_rayToWorld(this._context.bt_vec3_a);
    // }

    hasHit(): boolean {
        return this.impl.hasHit();
    }

    constructor(context: PhysicsSystem) {
        this._context = context;
        this.impl = this.createImpl()
    }

    protected abstract createImpl(): any;
}