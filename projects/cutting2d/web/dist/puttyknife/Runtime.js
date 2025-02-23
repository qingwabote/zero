import { textDecode, textEncode } from './text.js';
const noop = function () { };
export class Runtime {
    constructor() {
        this._callback_table = [noop];
        this.env = {
            pk_callback_table_invoke: (index, args) => {
                this._callback_table[index](args);
            }
        };
    }
    init(instance) {
        const buffer = instance.exports.memory.buffer;
        this._u8 = new Uint8Array(buffer);
        this._u16 = new Uint16Array(buffer);
        this._u32 = new Uint32Array(buffer);
        this._i32 = new Int32Array(buffer);
        this._f32 = new Float32Array(buffer);
        this._f64 = new Float64Array(buffer);
        this._exports = instance.exports;
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
    addFunction(f) {
        let i = 0;
        for (; i < this._callback_table.length; i++) {
            if (!this._callback_table[i]) {
                break;
            }
        }
        this._callback_table[i] = f;
        return i;
    }
    getArgs(ptr, ...types) {
        const args = new Array(types.length);
        let offset = 0;
        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            switch (t) {
                case 'p':
                    offset += offset % 4;
                    args[i] = this._u32[(ptr + offset) >> 2];
                    offset += 4;
                    break;
                case 'i32':
                    offset += offset % 4;
                    args[i] = this._i32[(ptr + offset) >> 2];
                    offset += 4;
                    break;
                case 'f32':
                    offset += offset % 8;
                    args[i] = this._f64[(ptr + offset) >> 3];
                    offset += 8;
                    break;
                default:
                    break;
            }
        }
        return args;
    }
    objAtArr(ptr, n) {
        return this._u32[(ptr + 4 * n) >> 2];
    }
}
