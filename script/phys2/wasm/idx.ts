import { wasi } from 'bastard';
import { loadWasm, textDecode } from 'boot';
import { bundle } from 'bundling';
import { Runtime } from 'puttyknife';

const preview1 = wasi.preview1(function (input: Uint8Array) {
    const text = textDecode(input);
    console.log(text);
});

const runtime = new Runtime;

const source = await loadWasm(bundle.resolve('phys.wasm'), {
    env: runtime.env,
    wasi_snapshot_preview1: preview1.moduleImports
})

preview1.init(source.instance);
runtime.init(source.instance);

export const phys = {
    fn: source.instance.exports as any,
    heap: runtime
} as const