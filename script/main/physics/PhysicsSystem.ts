import Ammo from "./impl/ammo.wasm.js";
import PhysicsWorld from "./PhysicsWorld.js";

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

    readonly bt_vec3_a: any;
    readonly bt_vec3_b: any;
    readonly bt_transform_a: any;

    readonly bt_quat_a: any;

    readonly world: PhysicsWorld;

    constructor(readonly ammo: any) {
        this.bt_vec3_a = new ammo.btVector3(0, 0, 0);
        this.bt_vec3_b = new ammo.btVector3(0, 0, 0);

        this.bt_transform_a = new ammo.btTransform();
        this.bt_quat_a = new ammo.btQuaternion(0, 0, 0, 1);

        this.world = new PhysicsWorld(this);
    }
}