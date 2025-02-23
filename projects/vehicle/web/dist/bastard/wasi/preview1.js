export function preview1(on_fd_write) {
    let HEAPU8;
    let HEAPU32;
    return {
        init(instance) {
            var _a, _b, _c, _d;
            // https://emscripten.org/docs/compiling/Building-Projects.html#emscripten-linker-output-files
            (_b = (_a = instance.exports)._start) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_d = (_c = instance.exports)._initialize) === null || _d === void 0 ? void 0 : _d.call(_c);
            const memory = instance.exports.memory;
            HEAPU8 = new Uint8Array(memory.buffer);
            HEAPU32 = new Uint32Array(memory.buffer);
        },
        moduleImports: {
            // emscripten and https://blog.dkwr.de/development/wasi-load-fd-write/
            fd_write(fd, iov, iovcnt, pnum) {
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
    };
}
