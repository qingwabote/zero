import _init from "./ammo.wasm.js";

declare const phys: {
    getWasm: () => Promise<ArrayBuffer>
};

const _ammo: any = {
    printErr: console.log.bind(console),
    locateFile: function () { return 'not care' },
};

async function _load() {
    _ammo.wasmBinary = await phys.getWasm();

    const emptyObj = {};
    if (typeof globalThis.window != 'object') {
        (globalThis as any).window = emptyObj;
    }
    await _init(_ammo);
    if ((globalThis as any).window == emptyObj) {
        (globalThis as any).window = undefined;
    }
}

let promise: Promise<void>;

export async function load() {
    if (promise) {
        return promise;
    }

    return promise = _load();
}

export const impl = _ammo;