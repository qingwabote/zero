import { ArgHandle, ArrayTypes, BufferHandle, FunctionHandle, ObjectHandle, StringHandle, TypedArray, Types } from 'pk';
import { textDecode, textEncode } from './text.js';

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

    newBuffer(bytes: number, alignment: number): BufferHandle {
        let ptr;
        if (alignment) {
            ptr = this._exports.aligned_alloc(alignment, bytes);
        } else {
            ptr = this._exports.malloc(bytes);
        }
        return ptr;
    }

    addBuffer(buffer: TypedArray, alignment: number): BufferHandle {
        let ptr: number = this.newBuffer(buffer.byteLength, alignment) as any;
        let source: TypedArray;
        let offset: number;
        switch (buffer.constructor.name) {
            case 'Uint8Array':
                source = this._u8;
                offset = ptr;
                break;
            case 'Float32Array':
                source = this._f32;
                offset = ptr >> 2;
                break;
            default:
                throw new Error(`unsupported type: ${buffer.constructor.name}`);
        }
        source.set(buffer, offset);
        return ptr as any;
    }

    locBuffer(handle: BufferHandle, offset: number): BufferHandle {
        return handle as any + offset;
    }

    getBuffer<T extends keyof ArrayTypes>(handle: BufferHandle, type: T, elements: number): ArrayTypes[T] {
        let begin: number;
        let source: TypedArray;
        switch (type) {
            case 'p':
                begin = handle as unknown as number >> 2;
                source = this._u32;
                break;
            case 'u8':
                begin = handle as unknown as number;
                source = this._u8;
                break;
            case 'u16':
                begin = handle as unknown as number >> 1;
                source = this._u16;
                break;
            case 'i32':
                begin = handle as unknown as number >> 2;
                source = this._i32;
                break;
            case 'f32':
                begin = handle as unknown as number >> 2;
                source = this._f32;
                break;
            default:
                throw new Error(`unsupported type: ${type}`);
        }
        return source.subarray(begin, begin + elements) as ArrayTypes[T];
    }

    cpyBuffer<Out extends number[], T extends keyof ArrayTypes>(out: Out, handle: BufferHandle, type: T, elements: number): Out {
        let begin: number;
        let source: TypedArray;
        switch (type) {
            case 'p':
                begin = handle as unknown as number >> 2;
                source = this._u32;
                break;
            case 'u8':
                begin = handle as unknown as number;
                source = this._u8;
                break;
            case 'u16':
                begin = handle as unknown as number >> 1;
                source = this._u16;
                break;
            case 'i32':
                begin = handle as unknown as number >> 2;
                source = this._i32;
                break;
            case 'f32':
                begin = handle as unknown as number >> 2;
                source = this._f32;
                break;
            default:
                throw new Error(`unsupported type: ${type}`);
        }
        for (let i = 0; i < elements; i++) {
            out[i] = source[begin + i];
        }
        return out;
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

    getArgs<T extends (keyof Types)[]>(ptr: ArgHandle, ...types: T): { [P in keyof T]: Types[T[P]]; } {
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

export declare const kind: any;
