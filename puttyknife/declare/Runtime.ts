declare const kind: unique symbol;

export declare type ObjectHandle = { readonly [kind]: 'Object' }

export declare type BufferHandle = { readonly [kind]: 'Buffer' }

export declare type StringHandle = { readonly [kind]: 'String' }

export declare type FunctionHandle = { readonly [kind]: 'Function' }

export declare type ArgHandle = { readonly [kind]: 'Arg' }

export declare interface Types {
    p: ObjectHandle,
    u16: number;
    i32: number,
    f32: number,
}

export declare interface ArrayTypes {
    /** BigInt64Array in jsb*/
    p: Uint32Array,
    u8: Uint8Array,
    u16: Uint16Array,
    i32: Int32Array,
    f32: Float32Array,
}

export declare type TypedArray = ArrayTypes[keyof ArrayTypes];

export declare class Runtime {
    constructor(...args: any[]);

    addBuffer(buffer: TypedArray): BufferHandle;
    getBuffer<T extends keyof ArrayTypes>(handle: BufferHandle, type: T, elements: number): ArrayTypes[T];
    cpyBuffer<Out extends number[], T extends keyof ArrayTypes>(out: Out, handle: BufferHandle, type: T, elements: number): Out;
    delBuffer(handle: BufferHandle): void;

    addString(value: string): StringHandle;
    getString(handle: StringHandle): string;
    delString(handle: StringHandle): void;

    addFunction(f: (args: ArgHandle) => any): FunctionHandle;

    getArgs<T extends (keyof Types)[]>(handle: ArgHandle, ...types: T): { [P in keyof T]: Types[T[P]]; };

    objAtArr(handle: ObjectHandle, n: number): ObjectHandle;
}
