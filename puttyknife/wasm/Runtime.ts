import type { ArgHandle, ArgTypes, BufferHandle, FunctionHandle, ObjectHandle, StringHandle } from 'puttyknife';
import { textDecode, textEncode } from './text.js';

type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

const noop = function () { };

export class Runtime {
    private _u8!: Uint8Array;
    private _u16!: Uint16Array;
    private _i32!: Int32Array;
    private _u32!: Uint32Array;
    private _f32!: Float32Array;
    private _f64!: Float64Array;

    private _exports: any;

    private readonly _callback_table: (Function | null)[] = [noop];

    readonly env = {
        pk_callback_table_invoke: (index: number, args: number) => {
            this._callback_table[index]!(args);
        }
    }

    init(instance: WebAssembly.Instance) {
        const buffer = (instance.exports.memory as any).buffer
        this._u8 = new Uint8Array(buffer);
        this._u16 = new Uint16Array(buffer);
        this._u32 = new Uint32Array(buffer);
        this._i32 = new Int32Array(buffer);
        this._f32 = new Float32Array(buffer);
        this._f64 = new Float64Array(buffer);

        this._exports = instance.exports;
    }

    addBuffer(buffer: TypedArray): BufferHandle {
        const ptr = this._exports.malloc(buffer.byteLength);
        this._u8.set(buffer, ptr);
        return ptr;
    }

    getBuffer(ptr: BufferHandle, size: number) {
        return this._u8.subarray(ptr as unknown as number, ptr as unknown as number + size);
    }

    delBuffer(ptr: BufferHandle) {
        this._exports.free(ptr as unknown as number);
    }

    addString(value: string): StringHandle {
        const size = value.length * 3 + 1; // Pessimistic
        const ptr = this._exports.malloc(size);
        const buffer = this._u8.subarray(ptr, ptr + size);
        buffer[textEncode(value, buffer)] = 0;
        return ptr;
    }

    delString(ptr: StringHandle) {
        this._exports.free(ptr);
    }

    getString(ptr: StringHandle): string {
        let end = ptr as unknown as number;
        while (this._u8[end]) {
            end++;
        }
        return textDecode(this._u8.subarray(ptr as unknown as number, end));
    }

    addFunction(f: Function): FunctionHandle {
        let i = 0;
        for (; i < this._callback_table.length; i++) {
            if (!this._callback_table[i]) {
                break;
            }
        }
        this._callback_table[i] = f;
        return i as unknown as FunctionHandle;
    }

    getArgs<T extends (keyof ArgTypes)[]>(ptr: ArgHandle, ...types: T): { [P in keyof T]: ArgTypes[T[P]]; } {
        const args: number[] = new Array(types.length);
        let offset = 0;
        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            switch (t) {
                case 'p':
                    offset += offset % 4;
                    args[i] = this._u32[(ptr as unknown as number + offset) >> 2];
                    offset += 4;
                    break;
                case 'i32':
                    offset += offset % 4;
                    args[i] = this._i32[(ptr as unknown as number + offset) >> 2];
                    offset += 4;
                    break;
                case 'f32':
                    offset += offset % 8;
                    args[i] = this._f64[(ptr as unknown as number + offset) >> 3];
                    offset += 8;
                    break;
                default:
                    break;
            }
        }
        return args as any;
    }

    objAtArr(ptr: ObjectHandle, n: number): ObjectHandle {
        return this._u32[(ptr as unknown as number + 4 * n) >> 2] as unknown as ObjectHandle;
    }
}