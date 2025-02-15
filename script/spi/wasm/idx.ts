import { wasi } from 'bastard';
import { loadWasm, textDecode } from 'boot';
import { bundle } from 'bundling';
import { PuttyKnife } from 'puttyknife';

const preview1 = wasi.preview1(function (input: Uint8Array) {
    const text = textDecode(input);
    console.log(text);
});

const source = await loadWasm(bundle.resolve('spi.wasm'), {
    wasi_snapshot_preview1: preview1.moduleImports
})

preview1.init(source.instance);

export const spi = {
    fn: source.instance.exports as any,
    heap: new PuttyKnife(source.instance.exports)
} as const