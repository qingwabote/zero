import { loadWasm, textDecode, textEncode } from 'boot';
import { bundle } from 'bundling';

let HEAPU8!: Uint8Array;
let HEAPU16!: Uint16Array;
let HEAPU32!: Uint32Array;
let HEAPF32!: Float32Array;

// emscripten and https://blog.dkwr.de/development/wasi-load-fd-write/
function fd_write(fd: number, iov: number, iovcnt: number, pnum: number) {
    // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
    var num = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov) >> 2)];
        var len = HEAPU32[(((iov) + (4)) >> 2)];
        const text = textDecode(HEAPU8.subarray(ptr, ptr + len))
        console.log(text);
        iov += 8;
        num += len;
    }
    HEAPU32[((pnum) >> 2)] = num;
    return 0;
};

const source = await loadWasm(bundle.resolve('spine-c.wasm'), {
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

export const wasm = {
    HEAPU8,
    HEAPU16,
    HEAPU32,
    HEAPF32,
    string_malloc(value: string): number {
        const size = value.length * 3 + 1; // Pessimistic
        const ptr = exports_.malloc(size);
        const buffer = HEAPU8.subarray(ptr, ptr + size);
        const written = textEncode(value, buffer);
        buffer[written] = 0;
        return ptr;
    },
    string_free: exports_.free as (ptr: number) => void,
    string_decode(c_string: number): string {
        let end = c_string;
        while (HEAPU8[end]) {
            end++;
        }
        return textDecode(HEAPU8.subarray(c_string, end));
    },
    exports: exports_
} as const