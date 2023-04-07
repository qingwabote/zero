import System from "../core/System.js";
import Zero from "../core/Zero.js";
import Ammo from "./impl/ammo.wasm.js";
import PhysicsWorld from "./PhysicsWorld.js";

export default class PhysicsSystem implements System {
    static readonly instance = new PhysicsSystem()

    private _bt_vec3_a: any;
    public get bt_vec3_a(): any {
        return this._bt_vec3_a;
    }

    private _bt_vec3_b: any;
    public get bt_vec3_b(): any {
        return this._bt_vec3_b;
    }

    private _bt_vec3_c: any;
    public get bt_vec3_c(): any {
        return this._bt_vec3_c;
    }

    private _bt_transform_a: any;
    public get bt_transform_a(): any {
        return this._bt_transform_a;
    }

    private _bt_quat_a: any;
    public get bt_quat_a(): any {
        return this._bt_quat_a;
    }

    private _ammo: any;
    public get ammo(): any {
        return this._ammo;
    }

    private _world!: PhysicsWorld;
    public get world(): PhysicsWorld {
        return this._world;
    }

    async load(): Promise<void> {
        const Module: any = {}
        Module.wasmBinary = await loader.load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
        Module.printErr = console.log.bind(console);
        Module.locateFile = function () { return 'not care' };

        const emptyObj = {};
        if (typeof globalThis.window != 'object') {
            (globalThis as any).window = emptyObj;
        }
        await Ammo(Module);
        if ((globalThis as any).window == emptyObj) {
            (globalThis as any).window = undefined;
        }

        this._bt_vec3_a = new Module.btVector3(0, 0, 0);
        this._bt_vec3_b = new Module.btVector3(0, 0, 0);
        this._bt_vec3_c = new Module.btVector3(0, 0, 0);
        this._bt_transform_a = new Module.btTransform();
        this._bt_quat_a = new Module.btQuaternion(0, 0, 0, 1);

        this._ammo = Module;

        this._world = new PhysicsWorld(this);
    }

    start(): void { }

    update(): void {
        this.world.stepSimulation()
    }
}

Zero.registerSystem(PhysicsSystem.instance, 1)