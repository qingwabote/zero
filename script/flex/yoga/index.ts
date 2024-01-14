import { loadWasm } from 'boot';
import { bundle } from 'bundling';
import wrapAssembly from './wrapAssembly.js';
import loadYoga from './yoga-wasm-esm.js';

const env: any = {
    instantiateWasm: function (imports: WebAssembly.Imports, successCallback: (instance: WebAssembly.Instance) => void) {
        loadWasm(bundle.resolve('yoga-wasm-esm.wasm'), imports).then(function (res) {
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
const yoga = await loadYoga(env);
if ((globalThis as any).window == emptyObj) {
    (globalThis as any).window = undefined;
}

export * from './generated/YGEnums.js';
export type {
    Config,
    DirtiedFunction,
    MeasureFunction,
    Node
} from './wrapAssembly.js';

export const impl = wrapAssembly(yoga);