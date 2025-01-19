import { loadWasm } from 'boot';
import { bundle } from 'bundling';
import wrapAssembly from './wrapAssembly.js';
import loadYoga from './yoga-wasm-esm.js';
const env = {
    instantiateWasm: function (imports, successCallback) {
        loadWasm(bundle.resolve('yoga-wasm-esm.wasm'), imports).then(function (res) {
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
const yoga = await loadYoga(env);
if (globalThis.window == emptyObj) {
    globalThis.window = undefined;
}
export * from './generated/YGEnums.js';
export const impl = wrapAssembly(yoga);
