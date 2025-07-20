declare const kind: unique symbol;

export declare type ObjectHandle = { readonly [kind]: 'Object' }

export declare type BufferHandle = { readonly [kind]: 'Buffer' }

export declare type StringHandle = { readonly [kind]: 'String' }

export declare type ArgHandle = { readonly [kind]: 'Arg' }

export declare type FunctionHandle = { readonly [kind]: 'Function' }

export declare type Pointer = ObjectHandle | BufferHandle | StringHandle | ArgHandle;

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
    u32: Uint32Array,
    i32: Int32Array,
    f32: Float32Array,
}

export declare type TypedArray = ArrayTypes[keyof ArrayTypes];

export declare class Runtime {
    constructor(...args: any[]);

    newBuffer(bytes: number, alignment: number): BufferHandle;
    addBuffer(copy: TypedArray, alignment: number): BufferHandle;
    locBuffer(handle: BufferHandle, offset: number): BufferHandle;
    getBuffer<T extends keyof ArrayTypes>(handle: BufferHandle, type: T, elements: number): ArrayTypes[T];
    cpyBuffer<Out extends number[], T extends keyof ArrayTypes>(out: Out, handle: BufferHandle, type: T, elements: number): Out;
    delBuffer(handle: BufferHandle): void;

    addString(value: string): StringHandle;
    getString(handle: StringHandle): string;
    delString(handle: StringHandle): void;

    addFunction(f: (args: ArgHandle) => any): FunctionHandle;

    getArgs<T extends (keyof Types)[]>(handle: ArgHandle, ...types: T): { [P in keyof T]: Types[T[P]]; };

    objAtArr(arr: ObjectHandle, n: number): ObjectHandle;

    // cpy32(dest: Pointer, src: Pointer, count: number, dest_offset?: number, src_offset?: number): void;
}
