type Pointer = number | bigint;

type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

export declare interface ArgTypes {
    p: Pointer,
    i32: number,
    f32: number,
}

export declare class PuttyKnife {
    constructor(...args);

    addBuffer(buffer: TypedArray): Pointer;
    getBuffer(ptr: Pointer, size: number): Uint8Array;
    delBuffer(ptr: Pointer): void;

    addString(value: string): Pointer;
    getString(ptr: Pointer): string;
    delString(ptr: Pointer): void;

    addFunction(f: (args: Pointer) => any): Pointer;

    getArgs<T extends (keyof ArgTypes)[]>(ptr: Pointer, ...types: T): { [P in keyof T]: ArgTypes[T[P]]; };

    ptrAtArr(ptr: Pointer, n: number): Pointer;
}
