import { bundle } from 'bundling';
import _init from "./ammo.wasm.js";

const _ammo: any = {
    printErr: console.log.bind(console),
    locateFile: function () { return 'not care' },
};

_ammo.wasmBinary = await bundle.raw.once('ammo.wasm.wasm', 'buffer');

const emptyObj = {};
if (typeof globalThis.window != 'object') {
    (globalThis as any).window = emptyObj;
}
await _init(_ammo);
if ((globalThis as any).window == emptyObj) {
    (globalThis as any).window = undefined;
}


export const impl = _ammo;