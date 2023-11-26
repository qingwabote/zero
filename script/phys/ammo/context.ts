import { loadWasm } from 'boot';
import { bundle } from 'bundling';
import _init from "./ammo.wasm.js";

const _ammo: any = {
    instantiateWasm: function (imports: WebAssembly.Imports, successCallback: (instance: WebAssembly.Instance) => void) {
        loadWasm(bundle.resolve('ammo.wasm.wasm'), imports).then(function (res) {
            successCallback(res.instance);
        })
    },
    printErr: console.log.bind(console),
    locateFile: function () { return 'trick' },
};

// trick
const emptyObj = {};
if (typeof globalThis.window != 'object') {
    (globalThis as any).window = emptyObj;
}
await _init(_ammo);
if ((globalThis as any).window == emptyObj) {
    (globalThis as any).window = undefined;
}

export const impl = _ammo;