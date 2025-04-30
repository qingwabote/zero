import * as pk from "pk";

declare namespace puttyknife {
    export class Runtime {
        newBuffer(bytes: number, alignment: number): pk.BufferHandle;
        addBuffer(copy: pk.TypedArray, alignment: number): pk.BufferHandle;
        locBuffer(handle: pk.BufferHandle, offset: number): pk.BufferHandle;
        getBuffer<T extends keyof pk.ArrayTypes>(handle: pk.BufferHandle, type: T, elements: number): pk.ArrayTypes[T];
        cpyBuffer<Out extends number[], T extends keyof pk.ArrayTypes>(out: Out, handle: pk.BufferHandle, type: T, elements: number): Out;
        delBuffer(handle: pk.BufferHandle): void;

        addString(value: string): pk.StringHandle;
        getString(handle: pk.StringHandle): string;
        delString(handle: pk.StringHandle): void;

        addFunction(f: (args: pk.ArgHandle) => any): pk.FunctionHandle;

        getArgs<T extends (keyof pk.Types)[]>(handle: pk.ArgHandle, ...types: T): { [P in keyof T]: pk.Types[T[P]]; };

        objAtArr(arr: pk.ObjectHandle, n: number): pk.ObjectHandle;
    }
}

export class Runtime extends puttyknife.Runtime {
    // locBuffer(handle: pk.BufferHandle, offset: number): pk.BufferHandle {
    //     // @ts-ignore
    //     return handle + BigInt(offset)
    // }
}

export declare const kind: any;