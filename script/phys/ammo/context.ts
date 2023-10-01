import _init from "./ammo.wasm.js";

declare const phys: {
    getWasm: () => Promise<ArrayBuffer>
};

const _ammo: any = {
    printErr: console.log.bind(console),
    locateFile: function () { return 'not care' },
};

_ammo.wasmBinary = await phys.getWasm();

const emptyObj = {};
if (typeof globalThis.window != 'object') {
    (globalThis as any).window = emptyObj;
}
await _init(_ammo);
if ((globalThis as any).window == emptyObj) {
    (globalThis as any).window = undefined;
}


export const impl = _ammo;