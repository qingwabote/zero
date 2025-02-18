declare const kind: unique symbol;

export declare type ObjectHandle = { readonly [kind]: 'Object' }

export declare type BufferHandle = { readonly [kind]: 'Buffer' }

export declare type StringHandle = { readonly [kind]: 'String' }

export declare type FunctionHandle = { readonly [kind]: 'Function' }

export declare type ArgHandle = { readonly [kind]: 'Arg' }

type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

export declare interface ArgTypes {
    p: ObjectHandle,
    i32: number,
    f32: number,
}

export declare class Runtime {
    constructor(...args: any[]);

    addBuffer(buffer: TypedArray): BufferHandle;
    getBuffer(handle: BufferHandle, size: number): Uint8Array;
    delBuffer(handle: BufferHandle): void;

    addString(value: string): StringHandle;
    getString(handle: StringHandle): string;
    delString(handle: StringHandle): void;

    addFunction(f: (args: ArgHandle) => any): FunctionHandle;

    getArgs<T extends (keyof ArgTypes)[]>(handle: ArgHandle, ...types: T): { [P in keyof T]: ArgTypes[T[P]]; };

    objAtArr(handle: ObjectHandle, n: number): ObjectHandle;
}
