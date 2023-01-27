import initModule from "./impl/helloworld.js";

export default class PhysicsSystem {
    private static _instance: PhysicsSystem;

    static get instance(): PhysicsSystem {
        return PhysicsSystem._instance;
    }

    static async initialize(): Promise<void> {
        const Module: any = {}
        Module.wasmBinary = await loader.load('../../asset/physics/helloworld.wasm', 'arraybuffer');
        Module.printErr = console.log.bind(console);
        Module.locateFile = function () { return 'not care' };

        const emptyObj = {};
        if (typeof globalThis.window != 'object') {
            (globalThis as any).window = emptyObj;
        }
        await initModule(Module);
        if ((globalThis as any).window == emptyObj) {
            (globalThis as any).window = undefined;
        }

        let foo = new Module.Foo();
        console.log("foo.getVal()", foo.getVal());
        PhysicsSystem._instance = new PhysicsSystem;
    }
}