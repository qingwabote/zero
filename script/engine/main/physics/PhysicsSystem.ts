import { System } from "../core/System.js";
import { Zero } from "../core/Zero.js";
import Ammo from "./impl/ammo.wasm.js";
import { PhysicsWorld } from "./PhysicsWorld.js";

const ammo: any = {}
ammo.wasmBinary = await getLoader()load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
ammo.printErr = console.log.bind(console);
ammo.locateFile = function () { return 'not care' };

const emptyObj = {};
if (typeof globalThis.window != 'object') {
    (globalThis as any).window = emptyObj;
}
await Ammo(ammo);
if ((globalThis as any).window == emptyObj) {
    (globalThis as any).window = undefined;
}

export class PhysicsSystem implements System {
    static readonly instance = new PhysicsSystem()

    readonly bt_vec3_a = new ammo.btVector3(0, 0, 0);

    readonly bt_vec3_b = new ammo.btVector3(0, 0, 0);

    readonly bt_vec3_c = new ammo.btVector3(0, 0, 0);

    readonly bt_transform_a = new ammo.btTransform();

    readonly bt_quat_a = new ammo.btQuaternion(0, 0, 0, 1);

    readonly ammo = ammo;

    readonly world: PhysicsWorld = new PhysicsWorld(ammo);

    start(): void { }

    update(): void {
        this.world.stepSimulation()
    }
}

Zero.registerSystem(PhysicsSystem.instance, 1)