// import { loader } from "../../core/impl.js";
// import init from "./ammo.wasm.js";

const _ammo: any = { loaded: false };

// _ammo.loading = (async function () {
//     _ammo.wasmBinary = await loader.load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
//     _ammo.printErr = console.log.bind(console);
//     _ammo.locateFile = function () { return 'not care' };

//     const emptyObj = {};
//     if (typeof globalThis.window != 'object') {
//         (globalThis as any).window = emptyObj;
//     }
//     await init(_ammo);
//     if ((globalThis as any).window == emptyObj) {
//         (globalThis as any).window = undefined;
//     }

//     _ammo.loaded = true;
// })()

_ammo.loading = new Promise(function () { })

export const ammo = _ammo;