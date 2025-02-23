import { textDecode, textEncode } from './text.js';
export class PuttyKnife {
    constructor(_exports) {
        this._exports = _exports;
        this._u8 = new Uint8Array(_exports.memory.buffer);
        this._u16 = new Uint16Array(_exports.memory.buffer);
        this._u32 = new Uint32Array(_exports.memory.buffer);
        this._f32 = new Float32Array(_exports.memory.buffer);
    }
    addBuffer(buffer) {
        const ptr = this._exports.malloc(buffer.byteLength);
        this._u8.set(buffer, ptr);
        return ptr;
    }
    getBuffer(ptr, size) {
        return this._u8.subarray(ptr, ptr + size);
    }
    delBuffer(ptr) {
        this._exports.free(ptr);
    }
    addString(value) {
        const size = value.length * 3 + 1; // Pessimistic
        const ptr = this._exports.malloc(size);
        const buffer = this._u8.subarray(ptr, ptr + size);
        buffer[textEncode(value, buffer)] = 0;
        return ptr;
    }
    delString(ptr) {
        this._exports.free(ptr);
    }
    getString(ptr) {
        let end = ptr;
        while (this._u8[end]) {
            end++;
        }
        return textDecode(this._u8.subarray(ptr, end));
    }
    // addFunction(f: Function): Pointer {
    //     const table: WebAssembly.Table = this._exports.__indirect_function_table;
    // }
    ptrAtArr(ptr, n) {
        return this._u32[(ptr + 4 * n) >> 2];
    }
}
