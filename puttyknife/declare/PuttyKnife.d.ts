type Pointer = number | bigint;

type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

export declare class PuttyKnife {
    constructor(...args);

    newBuffer(size: number): Pointer;
    addBuffer(buffer: TypedArray): Pointer;
    getBuffer(ptr: Pointer, size: number): Uint8Array;
    delBuffer(ptr: Pointer): void;

    addString(value: string): Pointer;
    getString(ptr: Pointer): string;
    delString(ptr: Pointer): void;

    ptrAtArr(ptr: Pointer, n: number): Pointer;
}
