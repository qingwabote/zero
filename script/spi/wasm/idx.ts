import { loadWasm, textDecode } from 'boot';
import { bundle } from 'bundling';
import { PuttyKnife } from 'puttyknife';

let HEAPU8!: Uint8Array;
let HEAPU16!: Uint16Array;
let HEAPU32!: Uint32Array;
let HEAPF32!: Float32Array;

// emscripten and https://blog.dkwr.de/development/wasi-load-fd-write/
function fd_write(fd: number, iov: number, iovcnt: number, pnum: number) {
    // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
    var num = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        const text = textDecode(HEAPU8.subarray(ptr, ptr + len))
        console.log(text);
        iov += 8;
        num += len;
    }
    HEAPU32[pnum >> 2] = num;
    return 0;
};

const source = await loadWasm(bundle.resolve('spi.wasm'), {
    wasi_snapshot_preview1: {
        fd_write
    }
})

/**name "exports" conflicts with systemjs*/
const exports_ = source.instance.exports as any;

HEAPU8 = new Uint8Array(exports_.memory.buffer);
HEAPU16 = new Uint16Array(exports_.memory.buffer);
HEAPU32 = new Uint32Array(exports_.memory.buffer);
HEAPF32 = new Float32Array(exports_.memory.buffer);

export const spi = {
    fn: exports_,
    heap: new PuttyKnife(exports_)
} as const