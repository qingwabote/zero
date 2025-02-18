export function preview1(on_fd_write: (input: Uint8Array) => void) {
    let HEAPU8!: Uint8Array;
    let HEAPU32!: Uint32Array;

    return {
        init(instance: WebAssembly.Instance) {
            // https://emscripten.org/docs/compiling/Building-Projects.html#emscripten-linker-output-files
            (instance.exports._start as CallableFunction)?.();
            (instance.exports._initialize as CallableFunction)?.();

            const memory = instance.exports.memory as WebAssembly.Memory;
            HEAPU8 = new Uint8Array(memory.buffer);
            HEAPU32 = new Uint32Array(memory.buffer);
        },
        moduleImports: {
            // emscripten and https://blog.dkwr.de/development/wasi-load-fd-write/
            fd_write(fd: number, iov: number, iovcnt: number, pnum: number) {
                // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
                var num = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    on_fd_write(HEAPU8.subarray(ptr, ptr + len));
                    iov += 8;
                    num += len;
                }
                HEAPU32[pnum >> 2] = num;
                return 0;
            },
            fd_close() {
                throw new Error("unimplemented");
            },
            fd_seek() {
                throw new Error("unimplemented");
            }
        }
    } as const;
}