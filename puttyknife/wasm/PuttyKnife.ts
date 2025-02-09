import { textDecode, textEncode } from './text.js';

type Pointer = number;

type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

export class PuttyKnife {
    private readonly _u8: Uint8Array;
    private readonly _u16: Uint16Array;
    private readonly _u32: Uint32Array;
    private readonly _f32: Float32Array;

    constructor(private readonly _exports: any) {
        this._u8 = new Uint8Array(_exports.memory.buffer);
        this._u16 = new Uint16Array(_exports.memory.buffer);
        this._u32 = new Uint32Array(_exports.memory.buffer);
        this._f32 = new Float32Array(_exports.memory.buffer);
    }

    newBuffer(size: number): Pointer {
        return this._exports.malloc(size);
    }

    addBuffer(buffer: TypedArray): Pointer {
        const ptr = this._exports.malloc(buffer.byteLength);
        this._u8.set(buffer, ptr);
        return ptr;
    }

    getBuffer(ptr: Pointer, size: number) {
        return this._u8.subarray(ptr, ptr + size);
    }

    delBuffer(ptr: Pointer) {
        this._exports.free(ptr);
    }

    addString(value: string): Pointer {
        const size = value.length * 3 + 1; // Pessimistic
        const ptr = this._exports.malloc(size);
        const buffer = this._u8.subarray(ptr, ptr + size);
        buffer[textEncode(value, buffer)] = 0;
        return ptr;
    }

    delString(ptr: Pointer) {
        this._exports.free(ptr);
    }

    getString(ptr: Pointer): string {
        let end = ptr;
        while (this._u8[end]) {
            end++;
        }
        return textDecode(this._u8.subarray(ptr, end));
    }

    ptrAtArr(ptr: Pointer, n: number): Pointer {
        return this._u32[(ptr + 4 * n) >> 2];
    }
}