import { wasi } from 'bastard';
import { loadWasm, textDecode } from 'boot';
import { bundle } from 'bundling';
import { PuttyKnife } from 'puttyknife';

const preview1 = wasi.preview1(function (input: Uint8Array) {
    const text = textDecode(input);
    console.log(text);
});

const puttyknife = new PuttyKnife;

const source = await loadWasm(bundle.resolve('yoga.wasm'), {
    env: puttyknife.env,
    wasi_snapshot_preview1: preview1.moduleImports
})

preview1.init(source.instance);
puttyknife.init(source.instance);

export const yoga = {
    fn: source.instance.exports as any,
    heap: puttyknife
} as const