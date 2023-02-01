import Ammo from "./impl/ammo.wasm.js";

export default class PhysicsSystem {
    private static _instance: PhysicsSystem;

    static get instance(): PhysicsSystem {
        return PhysicsSystem._instance;
    }

    static async initialize(): Promise<void> {
        const Module: any = {}
        Module.wasmBinary = await loader.load('../../asset/physics/ammo.wasm.wasm', 'arraybuffer');
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
        PhysicsSystem._instance = new PhysicsSystem(Module);
    }

    private _broadphase;
    private _dispatcher;
    private _solver;
    private _world;

    constructor(readonly ammo: any) {
        this._broadphase = new ammo.btDbvtBroadphase();
        this._dispatcher = new ammo.btCollisionDispatcher(new ammo.btDefaultCollisionConfiguration());
        this._solver = new ammo.btSequentialImpulseConstraintSolver();
        this._world = new ammo.btDiscreteDynamicsWorld(this._broadphase, this._dispatcher, this._solver);
    }
}