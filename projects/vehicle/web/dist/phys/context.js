import { loadWasm } from 'boot';
import { bundle } from 'bundling';
import _init from "./ammo.wasm.js";
const _ammo = {
    instantiateWasm: function (imports, successCallback) {
        loadWasm(bundle.resolve('ammo.wasm.wasm'), imports).then(function (res) {
            successCallback(res.instance);
        });
    },
    printErr: console.log.bind(console),
    locateFile: function () { return 'trick'; },
};
// trick
const emptyObj = {};
if (typeof globalThis.window != 'object') {
    globalThis.window = emptyObj;
}
await _init(_ammo);
if (globalThis.window == emptyObj) {
    globalThis.window = undefined;
}
export const impl = _ammo;
