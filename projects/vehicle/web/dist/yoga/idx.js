import { wasi } from 'bastard';
import { loadWasm, textDecode } from 'boot';
import { bundle } from 'bundling';
import { Runtime } from 'puttyknife';
const preview1 = wasi.preview1(function (input) {
    const text = textDecode(input);
    console.log(text);
});
const runtime = new Runtime;
const source = await loadWasm(bundle.resolve('yoga.wasm'), {
    env: runtime.env,
    wasi_snapshot_preview1: preview1.moduleImports
});
preview1.init(source.instance);
runtime.init(source.instance);
export const yoga = {
    fn: source.instance.exports,
    heap: runtime
};
