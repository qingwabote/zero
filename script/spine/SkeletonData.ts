import { spi } from "spi";
import { Atlas } from "./Atlas.js";

export class SkeletonData {
    readonly pointer: number;

    constructor(buffer: ArrayBuffer, altas: Atlas, scale: number = 1) {
        const sbPtr = spi.fn.spiSkeletonBinary_create(altas.pointer);
        spi.fn.spiSkeletonBinary_setScale(sbPtr, scale);
        const binaryPtr = spi.heap.addBuffer(new Uint8Array(buffer))
        const dataPtr = spi.fn.spiSkeletonBinary_readSkeletonData(sbPtr, binaryPtr, buffer.byteLength);
        if (!dataPtr) {
            throw new Error(spi.heap.getString(spi.fn.spiSkeletonBinary_getError(sbPtr)));
        }
        spi.heap.delBuffer(binaryPtr)
        spi.fn.spiSkeletonBinary_dispose(sbPtr);

        this.pointer = dataPtr;
    }
}