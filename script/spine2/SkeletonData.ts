import { Atlas } from "./Atlas.js";
import { wasm } from "./wasm.js";

export class SkeletonData {
    readonly pointer: number;

    constructor(buffer: ArrayBuffer, altas: Atlas) {
        const sbPtr = wasm.exports.spiSkeletonBinary_create(altas.pointer);
        const binaryPtr = wasm.exports.malloc(buffer.byteLength);
        wasm.HEAPU8.set(new Uint8Array(buffer), binaryPtr);
        const dataPtr = wasm.exports.spiSkeletonBinary_readSkeletonData(sbPtr, binaryPtr, buffer.byteLength);
        if (!dataPtr) {
            throw new Error(wasm.string_decode(wasm.exports.spiSkeletonBinary_getError(sbPtr)));
        }
        wasm.exports.free(binaryPtr);
        wasm.exports.spiSkeletonBinary_dispose(sbPtr);

        this.pointer = dataPtr;
    }
}