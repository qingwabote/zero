import { pk } from "puttyknife";
import { Atlas } from "./Atlas.js";

export class SkeletonData {
    readonly pointer: number;

    constructor(buffer: ArrayBuffer, altas: Atlas, scale: number = 1) {
        const sbPtr = pk.fn.spiSkeletonBinary_create(altas.pointer);
        pk.fn.spiSkeletonBinary_setScale(sbPtr, scale);
        const binaryPtr = pk.heap.addBuffer(new Uint8Array(buffer))
        const dataPtr = pk.fn.spiSkeletonBinary_readSkeletonData(sbPtr, binaryPtr, buffer.byteLength);
        if (!dataPtr) {
            throw new Error(pk.heap.getString(pk.fn.spiSkeletonBinary_getError(sbPtr)));
        }
        pk.heap.delBuffer(binaryPtr)
        pk.fn.spiSkeletonBinary_dispose(sbPtr);

        this.pointer = dataPtr;
    }
}